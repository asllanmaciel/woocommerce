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
	 * No textdomain reload is needed. WP_Locale_Switcher unloads every loaded textdomain as
	 * reloadable and lets it JIT-reload under the new locale, and it filters both `locale` and
	 * `determine_locale`, so the `plugin_locale` value WC()->load_plugin_textdomain() reads already
	 * resolves to the switched locale. A site layering a custom WP_LANG_DIR/woocommerce/*.mo gets
	 * the canonical translation inside the window rather than its override, since core's JIT reload
	 * does not know about that file.
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

			return $callback();
		} finally {
			if ( $locale_was_switched ) {
				restore_previous_locale();
			}
		}
	}
}
