<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CotizacionController;
use App\Http\Controllers\CotizacionDetalleController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\PublicProductoController;
use App\Http\Controllers\Panel\CotizacionPanelController;

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

    // Rutas para servicios excepto show
    Route::resource('servicios', ServicioController::class)->only(['index','store','update','destroy']);
    Route::patch('servicios/{servicio}/reactivate', [ServicioController::class, 'reactivate'])
  ->name('servicios.reactivate');

    // Rutas para categorias excepto show
    Route::resource('categorias', CategoriaController::class)
        ->except(['show']);
    // Rutas para marcas excepto show
    Route::resource('marcas', MarcaController::class)
        ->except(['show']);
    // Rutas para marcas excepto show
    Route::resource('personas', PersonaController::class)
        ->except(['show']);
    // Rutas para usuarios
    Route::get('/admin/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/admin/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::put('/admin/usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::delete('/admin/usuarios/{user}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
    // Lookup de personas
    Route::get('/admin/usuarios/personas-lookup', [UsuarioController::class, 'personasLookup']);
    // Activar usuario (para el botón “Activar”)
    Route::patch('/admin/usuarios/{usuario}/activar', [UsuarioController::class, 'activar']);

    // Rutas para productos excepto show
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

    Route::get('/cotizaciones', [CotizacionPanelController::class, 'index'])
        ->name('cotizaciones.index');
    Route::get('/cotizaciones/{cotizacion}', [CotizacionPanelController::class, 'show'])
        ->name('cotizaciones.show');
    Route::put('/cotizaciones/{cotizacion}/reply', [CotizacionPanelController::class, 'reply'])
        ->name('cotizaciones.reply');
    Route::post('/cotizaciones/{cotizacion}/send-email', [CotizacionPanelController::class, 'sendEmail'])
        ->name('cotizaciones.sendEmail');
    Route::post('/cotizaciones/{cotizacion}/send-whatsapp', [CotizacionPanelController::class, 'sendWhatsapp'])
        ->name('cotizaciones.sendWhatsapp');
});

require __DIR__ . '/settings.php';
