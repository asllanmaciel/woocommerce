<?php
declare( strict_types = 1 );

namespace Automattic\WooCommerce\Tests\Internal\Utilities;

use Automattic\WooCommerce\Internal\Utilities\SiteLocale;
use WC_Unit_Test_Case;

/**
 * Tests for the SiteLocale utility.
 */
class SiteLocaleTest extends WC_Unit_Test_Case {

	/**
	 * Write a minimal MO file translating the 'product' permalink slug.
	 *
	 * @param string $path        Target .mo path; parent directories are created.
	 * @param string $translation Translation for the 'product' slug.
	 */
	private function write_slug_mo( string $path, string $translation ): void {
		require_once ABSPATH . WPINC . '/pomo/mo.php';
		wp_mkdir_p( dirname( $path ) );

		$mo = new \MO();
		$mo->add_entry(
			new \Translation_Entry(
				array(
					'singular'     => 'product',
					'context'      => 'slug',
					'translations' => array( $translation ),
				)
			)
		);
		$mo->export_to_file( $path );
	}

	/**
	 * Simulate an admin request whose user locale (fr_FR) diverges from the en_US site locale.
	 */
	private function set_up_french_admin_request(): void {
		$user_id = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

		$this->assertSame( 'fr_FR', determine_locale(), 'The admin request should use the user locale before running.' );
	}

	/**
	 * @testdox Should resolve the site locale from the WPLANG option.
	 */
	public function test_get_resolves_the_wplang_option(): void {
		// sanitize_option() rejects languages without an installed pack, and the test env has none.
		$allow_french = static fn( array $languages ): array => array_merge( $languages, array( 'fr_FR' ) );

		add_filter( 'get_available_languages', $allow_french );
		try {
			update_option( 'WPLANG', 'fr_FR' );

			$this->assertSame( 'fr_FR', SiteLocale::get() );
		} finally {
			remove_filter( 'get_available_languages', $allow_french );
		}
	}

	/**
	 * @testdox Should fall back to en_US when no site language is configured.
	 */
	public function test_get_falls_back_to_en_us(): void {
		delete_option( 'WPLANG' );

		$this->assertSame( 'en_US', SiteLocale::get() );
	}

	/**
	 * @testdox Should not be affected by the `locale` filter.
	 */
	public function test_get_ignores_the_locale_filter(): void {
		$filter_locale = static fn(): string => 'de_DE';

		add_filter( 'locale', $filter_locale, 5 );
		try {
			$this->assertSame( 'en_US', SiteLocale::get(), 'Request-scoped locale filters must not change the resolved site locale.' );
		} finally {
			remove_filter( 'locale', $filter_locale, 5 );
		}
	}

	/**
	 * @testdox Should run the callback under the site locale and restore the request locale.
	 */
	public function test_run_executes_under_site_locale_and_restores(): void {
		$this->set_up_french_admin_request();

		$locale_inside = SiteLocale::run( 'determine_locale' );

		$this->assertSame( 'en_US', $locale_inside, 'The callback should observe the site locale.' );
		$this->assertSame( 'fr_FR', determine_locale(), 'The request locale should be restored afterwards.' );
	}

	/**
	 * @testdox Should fall back to en_US when the configured site locale is unavailable.
	 */
	public function test_run_falls_back_to_en_us_when_site_locale_is_unavailable(): void {
		$filter_site_locale = static fn(): string => 'zz_ZZ';

		$this->set_up_french_admin_request();
		add_filter( 'pre_option_WPLANG', $filter_site_locale );

		try {
			$this->assertNotContains( 'zz_ZZ', get_available_languages(), 'The configured site locale must be unavailable for this regression test.' );

			$locale_inside = SiteLocale::run( 'determine_locale' );

			$this->assertSame( 'en_US', $locale_inside, 'An unavailable site locale should use untranslated source strings, not the request locale.' );
			$this->assertSame( 'fr_FR', determine_locale(), 'The request locale should be restored afterwards.' );
		} finally {
			remove_filter( 'pre_option_WPLANG', $filter_site_locale );
		}
	}

	/**
	 * @testdox Should return the callback result unchanged when no locale switch is needed.
	 */
	public function test_run_passes_through_without_a_switch(): void {
		$this->assertSame( 'unchanged', SiteLocale::run( static fn(): string => 'unchanged' ) );
	}

	/**
	 * run() registers no filters of its own. Adding `plugin_locale` → `get_locale` would override
	 * any third-party registration at the same priority, and removing it would strip the
	 * registration owned by an enclosing wc_switch_to_site_locale() window.
	 *
	 * @testdox Should leave hook registrations untouched, including an enclosing window's.
	 */
	public function test_run_does_not_touch_plugin_locale_registrations(): void {
		$this->set_up_french_admin_request();

		$this->assertFalse( has_filter( 'plugin_locale', 'get_locale' ), 'The filter should be absent before running.' );

		SiteLocale::run( static fn() => null );

		$this->assertFalse( has_filter( 'plugin_locale', 'get_locale' ), 'run() must not leave a plugin_locale registration behind.' );

		// Stands in for an enclosing wc_switch_to_site_locale() window, which expects
		// wc_restore_locale() to be what removes this.
		add_filter( 'plugin_locale', 'get_locale' );
		try {
			SiteLocale::run( static fn() => null );

			$this->assertNotFalse( has_filter( 'plugin_locale', 'get_locale' ), 'The outer plugin_locale registration must survive a nested run.' );
		} finally {
			remove_filter( 'plugin_locale', 'get_locale' );
		}
	}

	/**
	 * @testdox Should resolve translations under the site locale rather than the request locale.
	 */
	public function test_run_resolves_translations_under_the_site_locale(): void {
		$this->set_up_french_admin_request();

		$translate_slug = static fn( string $translation, string $text, string $context ): string =>
			( 'slug' === $context && 'product' === $text ) ? 'produit' : $translation;

		// Stands in for a loaded fr_FR textdomain, since the test environment has no language packs.
		$maybe_translate = static function ( string $translation, string $text, string $context ) use ( $translate_slug ): string {
			return 'fr_FR' === determine_locale() ? $translate_slug( $translation, $text, $context ) : $translation;
		};

		add_filter( 'gettext_with_context_woocommerce', $maybe_translate, 10, 3 );
		try {
			$this->assertSame( 'produit', _x( 'product', 'slug', 'woocommerce' ), 'The request locale should translate before running.' );

			$slug_inside = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			$this->assertSame( 'product', $slug_inside, 'The callback should resolve translations under the site locale, not the request locale.' );
			$this->assertSame( 'produit', _x( 'product', 'slug', 'woocommerce' ), 'Translation resolution should be restored afterwards.' );
		} finally {
			remove_filter( 'gettext_with_context_woocommerce', $maybe_translate, 10 );
		}
	}

	/**
	 * A custom WP_LANG_DIR/woocommerce/woocommerce-{locale}.mo override is layered over the
	 * language pack by WC()->load_plugin_textdomain(), but core's JIT reload after a locale
	 * switch only knows the pack. If run() does not re-apply the layering, a request already in
	 * the site locale and a request that switches derive different slugs from the same site
	 * configuration.
	 *
	 * @testdox Should resolve custom translation overrides identically with and without a switch.
	 */
	public function test_run_layers_custom_translation_overrides_when_switching(): void {
		global $wp_locale_switcher;

		$custom_mo = WP_LANG_DIR . '/woocommerce/woocommerce-fr_FR.mo';
		$pack_mo   = WP_LANG_DIR . '/plugins/woocommerce-fr_FR.mo';
		$core_mo   = WP_LANG_DIR . '/fr_FR.mo';

		$this->write_slug_mo( $custom_mo, 'produit-custom' );
		$this->write_slug_mo( $pack_mo, 'produit' );
		// A core language file makes fr_FR genuinely available, so the availability
		// pre-check in run() keeps the configured site locale.
		$this->write_slug_mo( $core_mo, 'ignore' );

		$filter_site_locale = static fn(): string => 'fr_FR';
		add_filter( 'pre_option_WPLANG', $filter_site_locale );

		$property = new \ReflectionProperty( \WP_Locale_Switcher::class, 'available_languages' );
		$property->setAccessible( true );
		$original_languages = $property->getValue( $wp_locale_switcher );
		$property->setValue( $wp_locale_switcher, array_merge( $original_languages, array( 'fr_FR' ) ) );

		try {
			$this->assertSame( 'fr_FR', SiteLocale::get() );
			$this->assertNotSame( 'fr_FR', determine_locale(), 'The request must run in a different locale so run() has to switch.' );

			$slug_inside = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			$this->assertSame( 'produit-custom', $slug_inside, 'A switched request must resolve the same custom override a site-locale request resolves.' );
		} finally {
			$property->setValue( $wp_locale_switcher, $original_languages );
			remove_filter( 'pre_option_WPLANG', $filter_site_locale );
			unload_textdomain( 'woocommerce', true );
			wp_delete_file( $custom_mo );
			wp_delete_file( $pack_mo );
			wp_delete_file( $core_mo );
		}
	}

	/**
	 * An extension filtering `determine_locale` after WP_Locale_Switcher still reports the
	 * visitor language inside the switched window, so the layering target must be the locale
	 * run() actually switched to — not a re-read of the filterable request value.
	 *
	 * @testdox Should layer translations for the switched locale, not the filtered request locale.
	 */
	public function test_run_layers_for_the_switched_locale_not_the_filtered_request_locale(): void {
		$custom_mo = WP_LANG_DIR . '/woocommerce/woocommerce-fr_FR.mo';
		$this->write_slug_mo( $custom_mo, 'produit-custom' );

		$filter_request_locale = static fn(): string => 'fr_FR';
		add_filter( 'determine_locale', $filter_request_locale, 20 );

		try {
			$slug_inside = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			$this->assertSame( 'product', $slug_inside, 'The en_US window must not resolve the visitor-locale custom translation.' );
		} finally {
			remove_filter( 'determine_locale', $filter_request_locale, 20 );
			unload_textdomain( 'woocommerce', true );
			wp_delete_file( $custom_mo );
		}
	}

	/**
	 * WC()->load_plugin_textdomain() honors the public `plugin_locale` filter when building the
	 * ambient domain, so run() must honor it when layering, or requests that switch resolve
	 * different slugs than requests that do not.
	 *
	 * @testdox Should honor the plugin_locale filter identically with and without a switch.
	 */
	public function test_run_honors_plugin_locale_identically_with_and_without_a_switch(): void {
		$custom_mo = WP_LANG_DIR . '/woocommerce/woocommerce-de_DE.mo';
		$this->write_slug_mo( $custom_mo, 'produkt-custom' );

		$pin_plugin_locale     = static fn(): string => 'de_DE';
		$filter_visitor_locale = static fn(): string => 'fr_FR';
		add_filter( 'plugin_locale', $pin_plugin_locale );

		try {
			WC()->load_plugin_textdomain();
			$no_switch_slug = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			add_filter( 'locale', $filter_visitor_locale, 5 );
			$switched_slug = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			$this->assertSame( 'produkt-custom', $no_switch_slug, 'The no-switch request should resolve the plugin_locale translation.' );
			$this->assertSame( $no_switch_slug, $switched_slug, 'Both request shapes must resolve the same plugin_locale translation.' );
		} finally {
			remove_filter( 'locale', $filter_visitor_locale, 5 );
			remove_filter( 'plugin_locale', $pin_plugin_locale );
			unload_textdomain( 'woocommerce', true );
			wp_delete_file( $custom_mo );
		}
	}

	/**
	 * get_locale() does not validate availability, so a stale WPLANG naming a removed language
	 * still reaches the no-switch equality path on ordinary requests while other requests fall
	 * back to en_US. An unavailable site locale must resolve under the fallback on every shape.
	 *
	 * @testdox Should resolve under the fallback on all request shapes when the site locale is unavailable.
	 */
	public function test_run_applies_the_fallback_when_the_unavailable_site_locale_is_current(): void {
		$custom_mo = WP_LANG_DIR . '/woocommerce/woocommerce-fr_FR.mo';
		$this->write_slug_mo( $custom_mo, 'produit-custom' );

		$filter_site_locale    = static fn(): string => 'fr_FR';
		$filter_request_locale = static fn(): string => 'fr_FR';

		add_filter( 'pre_option_WPLANG', $filter_site_locale );
		add_filter( 'locale', $filter_request_locale, 5 );

		try {
			$this->assertNotContains( 'fr_FR', get_available_languages(), 'The site locale must be unavailable for this regression test.' );

			$ambient_slug = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			remove_filter( 'locale', $filter_request_locale, 5 );
			// Fresh request: the first run's restore re-layered the fr request's own ambient state.
			unload_textdomain( 'woocommerce', true );
			$divergent_slug = SiteLocale::run( static fn(): string => _x( 'product', 'slug', 'woocommerce' ) );

			$this->assertSame( 'product', $ambient_slug, 'An unavailable site locale must resolve under en_US even when the request already reports it.' );
			$this->assertSame( $ambient_slug, $divergent_slug, 'Both request shapes must resolve the same fallback value.' );
		} finally {
			remove_filter( 'locale', $filter_request_locale, 5 );
			remove_filter( 'pre_option_WPLANG', $filter_site_locale );
			unload_textdomain( 'woocommerce', true );
			wp_delete_file( $custom_mo );
		}
	}

	/**
	 * @testdox Should restore the request locale when the callback throws.
	 */
	public function test_run_restores_the_locale_when_the_callback_throws(): void {
		$this->set_up_french_admin_request();

		try {
			SiteLocale::run(
				static function (): void {
					throw new \RuntimeException( 'boom' );
				}
			);
			$this->fail( 'The callback exception should propagate.' );
		} catch ( \RuntimeException $e ) {
			$this->assertSame( 'boom', $e->getMessage() );
		}

		$this->assertSame( 'fr_FR', determine_locale(), 'The request locale should be restored even when the callback throws.' );
		$this->assertFalse( has_filter( 'plugin_locale', 'get_locale' ), 'No plugin_locale registration should be left behind.' );
	}
}
