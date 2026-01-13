<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\ProductosController;
use App\Http\Controllers\ServiciosController;
use App\Http\Controllers\CotizacionsController;

// Public (Guest)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/Servicios/cctv', function () {
    return Inertia::render('servicios/cctv');
})->name('Servicios.cctv');

// Protected (Auth)
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Productos
    Route::get('/productos', [ProductosController::class, 'index'])->name('productos.index');
    Route::post('/productos', [ProductosController::class, 'store'])->name('productos.store');
    Route::put('/productos/{producto}', [ProductosController::class, 'update'])->name('productos.update');
    Route::delete('/productos/{producto}', [ProductosController::class, 'destroy'])->name('productos.destroy');

    Route::post('/productos/{producto}/media', [ProductosController::class, 'mediaStore'])->name('productos.media.store');
    Route::delete('/productos/{producto}/media/{media}', [ProductosController::class, 'mediaDestroy'])->name('productos.media.destroy');

    // Servicios
    Route::get('/servicios', [ServiciosController::class, 'index'])->name('servicios.index');
    Route::post('/servicios', [ServiciosController::class, 'store'])->name('servicios.store');
    Route::put('/servicios/{servicio}', [ServiciosController::class, 'update'])->name('servicios.update');
    Route::delete('/servicios/{servicio}', [ServiciosController::class, 'destroy'])->name('servicios.destroy');

    // Cotizaciones (ticket / carrito simulado)
    Route::post('/cotizacions/draft', [CotizacionsController::class, 'createDraft'])->name('cotizacions.draft');
    Route::get('/cotizacions/{cotizacion}', [CotizacionsController::class, 'show'])->name('cotizacions.show');

    Route::post('/cotizacions/{cotizacion}/items', [CotizacionsController::class, 'addItem'])->name('cotizacions.items.add');
    Route::delete('/cotizacions/{cotizacion}/items/{detalle}', [CotizacionsController::class, 'removeItem'])->name('cotizacions.items.remove');

    Route::post('/cotizacions/{cotizacion}/send', [CotizacionsController::class, 'send'])->name('cotizacions.send');
    
});

require __DIR__ . '/settings.php';
