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
		$user_id = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

		$this->assertSame( 'fr_FR', determine_locale(), 'The admin request should use the user locale before running.' );

		$locale_inside = SiteLocale::run( 'determine_locale' );

		$this->assertSame( 'en_US', $locale_inside, 'The callback should observe the site locale.' );
		$this->assertSame( 'fr_FR', determine_locale(), 'The request locale should be restored afterwards.' );
	}

	/**
	 * @testdox Should fall back to en_US when the configured site locale is unavailable.
	 */
	public function test_run_falls_back_to_en_us_when_site_locale_is_unavailable(): void {
		$filter_site_locale = static fn(): string => 'zz_ZZ';
		$user_id            = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);

		add_filter( 'pre_option_WPLANG', $filter_site_locale );
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

		try {
			$this->assertNotContains( 'zz_ZZ', get_available_languages(), 'The configured site locale must be unavailable for this regression test.' );
			$this->assertSame( 'fr_FR', determine_locale(), 'The admin request should use the user locale before running.' );

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
	 * run() deliberately registers no filters of its own: WP_Locale_Switcher already filters
	 * `locale` and `determine_locale`, so the `plugin_locale` value that
	 * WC()->load_plugin_textdomain() reads resolves to the switched locale without help.
	 * Registering `plugin_locale` → `get_locale` here would also override any third-party
	 * registration at the same priority, and tearing it down would strip the registration of
	 * an enclosing wc_switch_to_site_locale() window.
	 *
	 * @testdox Should leave hook registrations untouched, including an enclosing window's.
	 */
	public function test_run_does_not_touch_plugin_locale_registrations(): void {
		$user_id = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

		$this->assertFalse( has_filter( 'plugin_locale', 'get_locale' ), 'The filter should be absent before running.' );

		SiteLocale::run( static fn() => null );

		$this->assertFalse( has_filter( 'plugin_locale', 'get_locale' ), 'run() must not leave a plugin_locale registration behind.' );

		// An enclosing wc_switch_to_site_locale() window owns this registration and expects
		// wc_restore_locale() to be the one that removes it.
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
		$user_id = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

		$translate_slug = static fn( string $translation, string $text, string $context ): string =>
			( 'slug' === $context && 'product' === $text ) ? 'produit' : $translation;

		// Stands in for a loaded fr_FR textdomain: the test environment has no language packs,
		// so the switch is observed through a gettext filter that only applies while switched.
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
	 * @testdox Should restore the request locale when the callback throws.
	 */
	public function test_run_restores_the_locale_when_the_callback_throws(): void {
		$user_id = self::factory()->user->create(
			array(
				'role'   => 'administrator',
				'locale' => 'fr_FR',
			)
		);
		wp_set_current_user( $user_id );
		set_current_screen( 'options-permalink' );

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
