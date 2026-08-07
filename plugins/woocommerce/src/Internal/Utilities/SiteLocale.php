<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Utilities;

/**
 * Utility for resolving the site's configured locale deterministically and running code under it.
 *
 * The get_locale() value reflects per-request state: temporary WP_Locale_Switcher switches, per-visitor
 * `locale` filters from multilingual plugins, and a `$GLOBALS['locale']` cache that can go stale
 * across switch_to_blog(). Values persisted site-wide, or compared against persisted values, must
 * not depend on any of that, or whichever request runs first decides what gets stored.
 *
 * @since 11.1.0
 */
class SiteLocale {
	private const FALLBACK_LOCALE = 'en_US';

	/**
	 * Resolve the site's configured locale from stored settings, bypassing request state.
	 *
	 * Mirrors get_locale()'s resolution chain but skips the `$GLOBALS['locale']` cache and the
	 * `locale` filter: the cache can be stale after switch_to_blog(), and the filter reflects a
	 * temporary switch or the current visitor's language on multilingual sites. WordPress has no
	 * unfiltered equivalent — get_locale(), determine_locale() and get_user_locale() are all
	 * filtered — so the chain is mirrored here.
	 *
	 * Keep the branches below in step with wp-includes/l10n.php::get_locale(). Each covers a real
	 * configuration (network default, wp-config.php constant, localized build); dropping one makes
	 * this resolve differently from WordPress itself.
	 *
	 * @return string The site locale, e.g. 'en_US'.
	 *
	 * @since 11.1.0
	 */
	public static function get(): string {
		if ( is_multisite() && wp_installing() ) {
			$site_locale = get_site_option( 'WPLANG' );
		} else {
			$site_locale = get_option( 'WPLANG' );

			if ( false === $site_locale && is_multisite() ) {
				$site_locale = get_site_option( 'WPLANG' );
			}
		}

		if ( false === $site_locale ) {
			$site_locale = defined( 'WPLANG' ) ? WPLANG : ( $GLOBALS['wp_local_package'] ?? '' );
		}

		return empty( $site_locale ) ? self::FALLBACK_LOCALE : (string) $site_locale;
	}

	/**
	 * Run a callback with translations loaded for the site locale.
	 *
	 * Switches only when the request locale differs from the site locale. If the configured locale
	 * is unavailable, the callback runs under en_US so untranslated source strings are used
	 * deterministically. The previous locale is restored afterwards, even when the callback throws.
	 *
	 * The callback must resolve WooCommerce translations identically on requests that switch and
	 * requests that do not. WP_Locale_Switcher handles the switch itself — it unloads every loaded
	 * textdomain as reloadable and lets it JIT-reload under the new locale — but the JIT reload
	 * only knows standard language-pack paths, while WC()->load_plugin_textdomain() layers a
	 * custom WP_LANG_DIR/woocommerce/woocommerce-{locale}.mo file over the pack, honoring the
	 * public `plugin_locale` filter as it does. So the same construction, filter included, is
	 * applied before the callback in both branches, and again after restoring so the
	 * request's own layering survives the switch. Without it, a site with such a custom file
	 * stores the override slug on site-locale requests but compares against the pack slug on
	 * switched requests, and the stored value never matches the screen.
	 *
	 * @param callable $callback The code to run under the site locale.
	 * @return mixed The callback's return value.
	 *
	 * @since 11.1.0
	 */
	public static function run( callable $callback ) {
		$site_locale = self::get();

		/*
		 * A stale WPLANG can keep naming a language whose files were removed. get_locale() does
		 * not validate availability, so ordinary requests still report that locale and would take
		 * the no-switch path while other requests fail the switch and fall back — two results
		 * from one configuration. Resolve an unavailable site locale to the fallback up front.
		 */
		// Both core functions return their filter's output uncast; coerce before strictly typed use.
		if ( self::FALLBACK_LOCALE !== $site_locale && ! in_array( $site_locale, (array) get_available_languages(), true ) ) {
			$site_locale = self::FALLBACK_LOCALE;
		}

		$current_locale = (string) determine_locale();
		$switched_to    = null;

		try {
			// determine_locale() may reflect a temporary locale switch, a locale filter, or a different blog's cached locale.
			if ( $current_locale !== $site_locale ) {
				if ( switch_to_locale( $site_locale ) ) {
					$switched_to = $site_locale;
				} elseif ( self::FALLBACK_LOCALE !== $current_locale && switch_to_locale( self::FALLBACK_LOCALE ) ) {
					$switched_to = self::FALLBACK_LOCALE;
				}
			}

			/*
			 * The target is passed explicitly rather than re-reading determine_locale(): an
			 * extension filtering it after WP_Locale_Switcher still reports the visitor language
			 * inside the window, and layering that MO would defeat the switch.
			 */
			self::layer_custom_translations( $switched_to ?? $current_locale );

			return $callback();
		} finally {
			if ( null !== $switched_to ) {
				restore_previous_locale();
				self::layer_custom_translations( $current_locale );
				// restore_previous_locale() leaves the translation controller on the switcher's
				// bootstrap locale, not the recorded request locale a `locale` filter supplied.
				\WP_Translation_Controller::get_instance()->set_locale( $current_locale );
			}
		}
	}

	/**
	 * Re-apply WooCommerce's custom translation layering for a locale.
	 *
	 * Mirrors WC()->load_plugin_textdomain() without requiring an initialized WooCommerce
	 * instance: when a custom WP_LANG_DIR/woocommerce/woocommerce-{locale}.mo exists, the domain
	 * is rebuilt as that file layered over the standard language pack. A no-op without the custom
	 * file — the standard pack alone is exactly what core's JIT reload produces on its own.
	 *
	 * @param string $locale Locale to layer translations for, before `plugin_locale` filtering.
	 */
	private static function layer_custom_translations( string $locale ): void {
		/** This filter is documented in wp-includes/l10n.php */
		$filtered_locale = apply_filters( 'plugin_locale', $locale, 'woocommerce' ); // phpcs:ignore WooCommerce.Commenting.CommentHooks.MissingSinceComment -- Core filter, documented in wp-includes/l10n.php.

		// The filter is a public contract WC()->load_plugin_textdomain() honors when building the
		// ambient domain, so honor it here too — but any callback can return anything, and it only
		// picks the files: the loads stay keyed to the actual locale, or the pinned value would
		// leak into WP_Translation_Controller's current locale for every later translation.
		$file_locale = is_string( $filtered_locale ) && '' !== $filtered_locale ? $filtered_locale : $locale;

		$custom_translation_path = WP_LANG_DIR . '/woocommerce/woocommerce-' . $file_locale . '.mo';

		if ( ! is_readable( $custom_translation_path ) ) {
			return;
		}

		// Evict the domain's already loaded files — the switch eagerly JIT-loads the target pack,
		// which would keep precedence over the custom file. Controller-level eviction, unlike the
		// non-reloadable unload WC()->load_plugin_textdomain() uses, leaves just-in-time loading
		// armed: the unload marker is never cleared by regular loads, and would block the request
		// locale's pack from reloading after the restore.
		unload_textdomain( 'woocommerce', true );
		\WP_Translation_Controller::get_instance()->unload_textdomain( 'woocommerce' );
		load_textdomain( 'woocommerce', $custom_translation_path, $locale );
		load_textdomain( 'woocommerce', WP_LANG_DIR . '/plugins/woocommerce-' . $file_locale . '.mo', $locale );
	}
}
