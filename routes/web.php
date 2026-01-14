<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ProductosController;
use App\Http\Controllers\ServiciosController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\MarcaController;
use App\Http\Controllers\CotizacionController;
use App\Http\Controllers\CotizacionDetalleController;
use App\Http\Controllers\PersonaController;

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
    Route::resource('productos', PrdocutoController::class)
        ->except(['show']);

    // Media de productos
    Route::post('/productos/{producto}/media', [ProductosController::class, 'mediaStore'])->name('productos.media.store');
    Route::delete('/productos/{producto}/media/{media}', [ProductosController::class, 'mediaDestroy'])->name('productos.media.destroy');

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
