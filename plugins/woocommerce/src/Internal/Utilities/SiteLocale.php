<?php
declare( strict_types=1 );

namespace Automattic\WooCommerce\Internal\Utilities;

/**
 * Utility for resolving the site's configured locale deterministically and running code under it.
 *
 * The get_locale() function reflects per-request state: temporary switches made through WP_Locale_Switcher,
 * per-visitor `locale` filters from multilingual plugins, and the `$GLOBALS['locale']` cache
 * (which can be stale across switch_to_blog() calls). Values that are persisted site-wide, or
 * compared against persisted values, must not depend on any of that — otherwise whichever
 * request happens to run first decides what gets stored.
 *
 * @since 11.1.0
 */
class SiteLocale {
	private const FALLBACK_LOCALE = 'en_US';

	/**
	 * Resolve the site's configured locale from stored settings, bypassing request state.
	 *
	 * Mirrors get_locale()'s underlying resolution chain (WPLANG option, network option,
	 * WPLANG constant, localized build) but skips the `$GLOBALS['locale']` cache and the
	 * `locale` filter: the cache can be stale after switch_to_blog(), and the filter reflects
	 * a temporary locale switch or the current visitor's language on multilingual sites.
	 * The result is deterministic for a given site configuration, whichever request asks.
	 *
	 * WordPress exposes no unfiltered equivalent — get_locale(), determine_locale() and
	 * get_user_locale() are all filtered — so the chain has to be mirrored here. Keep the
	 * branches below in step with wp-includes/l10n.php::get_locale(); each one corresponds to
	 * a real configuration (network default, wp-config.php constant, localized WP build) and
	 * dropping any of them makes this resolve differently from WordPress itself.
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
	 * Switches the locale only when the current request locale differs from the site locale.
	 * If the configured locale is unavailable, the callback runs under en_US so untranslated
	 * source strings are used deterministically. The previous locale is restored afterwards,
	 * even when the callback throws.
	 *
	 * Reloading the WooCommerce textdomain here would be redundant. Since WordPress 6.1 —
	 * well below the 6.9 minimum this plugin requires — WP_Locale_Switcher::load_translations()
	 * unloads every loaded textdomain as reloadable and lets it JIT-reload under the new
	 * locale, and the switcher filters both `locale` and `determine_locale`, so the
	 * `plugin_locale` value that WC()->load_plugin_textdomain() reads already resolves to the
	 * switched locale. The one case it would still cover is a site layering a non-standard
	 * custom WP_LANG_DIR/woocommerce/*.mo file, which core's JIT reload does not know about;
	 * that trade-off is accepted here in exchange for not carrying the filter machinery.
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
			if ( $current_locale !== $site_locale && function_exists( 'switch_to_locale' ) ) {
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
