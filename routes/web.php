<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\PublicProductoController;
use App\Http\Controllers\Panel\CotizacionPanelController;
use App\Http\Controllers\Panel\CotizacionDetalleController;

// Index del sitio web
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Página pública de servicios cctv
Route::get('/servicios/cctv', function () {
    return Inertia::render('servicios/cctv');
})->name('Servicios.cctv');

Route::get('/catalogo', [PublicProductoController::class, 'index'])
    ->name('catalogo.publico');

// -------------------------
// Protected (Auth)
// -------------------------
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Servicios (sin show)
    Route::resource('servicios', ServicioController::class)->only(['index','store','update','destroy']);
    Route::patch('servicios/{servicio}/reactivate', [ServicioController::class, 'reactivate'])
        ->name('servicios.reactivate');

    // Categorías / Marcas / Personas (sin show)
    Route::resource('categorias', CategoriaController::class)->except(['show']);
    Route::resource('marcas', MarcaController::class)->except(['show']);
    Route::resource('personas', PersonaController::class)->except(['show']);

    // -------------------------
    // Admin: Usuarios
    // -------------------------
    Route::prefix('admin')->group(function () {
        Route::get('usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
        Route::post('usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
        Route::put('usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
        Route::delete('usuarios/{user}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

        // Lookup de personas (para combobox / search)
        Route::get('usuarios/personas-lookup', [UsuarioController::class, 'personasLookup'])
            ->name('usuarios.personasLookup');

        // Activar usuario
        Route::patch('usuarios/{user}/activar', [UsuarioController::class, 'activar'])
            ->name('usuarios.activar');
    });

    // -------------------------
    // Productos
    // -------------------------
    Route::resource('productos', ProductoController::class);
    Route::post('productos/{producto}/medias', [ProductoController::class, 'mediaUpload'])
        ->name('productos.medias.upload');
    Route::patch('productos/{producto}/medias/order', [ProductoController::class, 'mediaUpdateOrder'])
        ->name('productos.medias.order');
    Route::patch('productos/{producto}/medias/{media}/main', [ProductoController::class, 'mediaSetMain'])
        ->name('productos.medias.main');
    Route::patch('productos/{producto}/medias/{media}', [ProductoController::class, 'mediaUpdate'])
        ->name('productos.medias.update');
    Route::delete('productos/{producto}/medias/{media}', [ProductoController::class, 'mediaDestroy'])
        ->name('productos.medias.destroy');
    Route::patch('productos/{producto}/toggle-status', [ProductoController::class, 'toggleStatus'])
        ->name('productos.toggleStatus');

    // -------------------------
    // Cotizaciones
    // -------------------------
    Route::get('cotizaciones', [CotizacionPanelController::class, 'index'])->name('cotizaciones.index');
    Route::get('cotizaciones/{cotizacion}', [CotizacionPanelController::class, 'show'])->name('cotizaciones.show');
    Route::put('cotizaciones/{cotizacion}', [CotizacionPanelController::class, 'update'])->name('cotizaciones.update');
    Route::delete('cotizaciones/{cotizacion}', [CotizacionPanelController::class, 'destroy'])->name('cotizaciones.destroy');

    Route::post('cotizaciones/{cotizacion}/add-item', [CotizacionPanelController::class, 'addItem'])->name('cotizaciones.addItem');
    Route::post('cotizaciones/{cotizacion}/send', [CotizacionPanelController::class, 'send'])->name('cotizaciones.send');
    Route::post('cotizaciones/{cotizacion}/mark-sent', [CotizacionPanelController::class, 'markSent'])->name('cotizaciones.markSent');

    Route::put('cotizaciones/detalles/{detalle}', [CotizacionDetalleController::class, 'update'])->name('cotizaciones.detalles.update');
    Route::delete('cotizaciones/detalles/{detalle}', [CotizacionDetalleController::class, 'destroy'])->name('cotizaciones.detalles.destroy');
});

require __DIR__ . '/settings.php';
