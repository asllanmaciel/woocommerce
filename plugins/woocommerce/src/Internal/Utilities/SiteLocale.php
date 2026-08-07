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
	 * custom WP_LANG_DIR/woocommerce/woocommerce-{locale}.mo file over the pack. So the same
	 * layering is applied before the callback in both branches, and again after restoring so the
	 * request's own layering survives the switch. Without it, a site with such a custom file
	 * stores the override slug on site-locale requests but compares against the pack slug on
	 * switched requests, and the stored value never matches the screen.
	 *
	 * @param callable $callback The code to run under the site locale.
	 * @return mixed The callback's return value.
	 */
	public static function run( callable $callback ) {
		$site_locale         = self::get();
		$current_locale      = determine_locale();
		$locale_was_switched = false;

		try {
			// determine_locale() may reflect a temporary locale switch, a locale filter, or a different blog's cached locale.
			if ( $current_locale !== $site_locale ) {
				$locale_was_switched = switch_to_locale( $site_locale );

				if ( ! $locale_was_switched && self::FALLBACK_LOCALE !== $current_locale ) {
					$locale_was_switched = switch_to_locale( self::FALLBACK_LOCALE );
				}
			}

			self::layer_custom_translations( determine_locale() );

			return $callback();
		} finally {
			if ( $locale_was_switched ) {
				restore_previous_locale();
				self::layer_custom_translations( determine_locale() );
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
	 * The unload is reloadable, unlike WC's loader, so translations for domains this method does
	 * not rebuild keep JIT-reloading for the rest of the request.
	 *
	 * @param string $locale Locale to layer translations for.
	 */
	private static function layer_custom_translations( string $locale ): void {
		$custom_translation_path = WP_LANG_DIR . '/woocommerce/woocommerce-' . $locale . '.mo';

		if ( ! is_readable( $custom_translation_path ) ) {
			return;
		}

		unload_textdomain( 'woocommerce', true );
		load_textdomain( 'woocommerce', $custom_translation_path, $locale );
		load_textdomain( 'woocommerce', WP_LANG_DIR . '/plugins/woocommerce-' . $locale . '.mo', $locale );
	}
}
