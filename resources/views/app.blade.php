<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'light') === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Tema principal: LIGHT por defecto.
             Solo aplica dark si el usuario lo eligió explícitamente. --}}
        <script>
            (function () {
                const appearance = @json($appearance ?? 'light');

                document.documentElement.classList.remove('dark');

                if (appearance === 'dark') {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        {{-- Fondo inicial para evitar flash incorrecto al cargar --}}
        <style>
            html {
                background-color: oklch(1 0 0);
                color-scheme: light;
            }

            html.dark {
                background-color: oklch(0.145 0 0);
                color-scheme: dark;
            }
        </style>

        <title inertia>{{ config('app.name', 'RSA Ingeniería Integral') }}</title>

        {{-- SEO base --}}
        <meta name="description" content="RSA Ingeniería Integral ofrece soluciones de seguridad electrónica, CCTV, control de acceso, GPS, cercas eléctricas y más.">
        <meta name="keywords" content="seguridad electrónica, CCTV, control de acceso, GPS, cercas eléctricas, alarmas, dashcam, RSA Ingeniería Integral">
        <meta name="author" content="RSA Ingeniería Integral">
        <meta name="robots" content="index, follow">
        <meta name="theme-color" content="#ffffff">
        <meta name="color-scheme" content="light dark">

        {{-- Open Graph --}}
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="RSA Ingeniería Integral">
        <meta property="og:title" content="RSA Ingeniería Integral">
        <meta property="og:description" content="Soluciones de seguridad electrónica para empresas y hogares.">
        <meta property="og:url" content="{{ config('app.url') }}">
        <meta property="og:image" content="{{ asset('apple-touch-icon.png') }}">

        {{-- Twitter --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="RSA Ingeniería Integral">
        <meta name="twitter:description" content="Soluciones de seguridad electrónica para empresas y hogares.">
        <meta name="twitter:image" content="{{ asset('apple-touch-icon.png') }}">

        {{-- Iconos --}}
        <link rel="icon" href="{{ asset('favicon.png') }}" sizes="any">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        {{-- Canonical --}}
        <link rel="canonical" href="{{ config('app.url') }}">

        {{-- Fonts --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />

        @vite(['resources/js/app.ts', "resources/js/pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-background text-foreground">
        @inertia
    </body>
</html>
