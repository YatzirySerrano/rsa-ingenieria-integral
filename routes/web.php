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
    Route::resource('servicios', ServicioController::class)
        ->except(['show']);
    // Rutas para categorias excepto show
    Route::resource('categorias', CategoriaController::class)
        ->except(['show']);
    // Rutas para marcas excepto show
    Route::resource('marcas', MarcaController::class)
        ->except(['show']);
    // Rutas para marcas excepto show
    Route::resource('personas', PersonaController::class)
        ->except(['show']);
    // Rutas para productos excepto show
    Route::resource('productos', ProductoController::class)
        ->except(['show']);
    // Rutas para usuarios
    Route::get('/admin/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
    Route::post('/admin/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
    Route::put('/admin/usuarios/{user}', [UsuarioController::class, 'update'])->name('usuarios.update');
    Route::delete('/admin/usuarios/{user}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');
    Route::get('/admin/usuarios/personas-lookup', [UsuarioController::class, 'personasLookup'])
  ->name('usuarios.personasLookup');

    // Media de productos (rutas web, no api)
    Route::post('/productos/{producto}/media', [ProductoController::class, 'mediaUpload'])
    ->name('productos.media.upload');
    Route::post('/productos/{producto}/media/order', [ProductoController::class, 'mediaUpdateOrder'])
        ->name('productos.media.order');
    Route::post('/productos/{producto}/media/{media}/main', [ProductoController::class, 'mediaSetMain'])
        ->name('productos.media.main');
    Route::put('/productos/{producto}/media/{media}', [ProductoController::class, 'mediaUpdate'])
        ->name('productos.media.update');
    Route::delete('/productos/{producto}/media/{media}', [ProductoController::class, 'mediaDestroy'])
        ->name('productos.media.destroy');

    // Ruta para mostrar la cotización
    Route::resource('cotizaciones', CotizacionController::class)
        ->except(['show']);
    // Ruta para agregar items(productos o servicios) a la cotizacion
    Route::post('cotizaciones/{cotizacion}/add-item', [CotizacionController::class, 'addItem'])
        ->name('cotizaciones.addItem');
    // Ruta para enviar la cotizacion
    Route::post('cotizaciones/{cotizacion}/send', [CotizacionController::class, 'send'])
        ->name('cotizaciones.send');
    // Ruta para mostrar los detalles de una cotización
    Route::resource('cotizacion-detalles', CotizacionDetalleController::class)
        ->only(['index', 'edit', 'update', 'destroy']);

});

require __DIR__ . '/settings.php';
