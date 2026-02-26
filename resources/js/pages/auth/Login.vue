<script setup lang="ts">
    import InputError from '@/components/InputError.vue'
    import TextLink from '@/components/TextLink.vue'
    import { Button } from '@/components/ui/button'
    import { Checkbox } from '@/components/ui/checkbox'
    import { Input } from '@/components/ui/input'
    import { Label } from '@/components/ui/label'
    import { Spinner } from '@/components/ui/spinner'
    import { Form, Head, Link } from '@inertiajs/vue3'
    import { ref } from 'vue'
    import { GalleryVerticalEnd } from 'lucide-vue-next'
    import loginCoverMobile from '@/img/login-cover-mobile.jpg'
    import loginCoverDesktop from '@/img/login-cover-desktop.png'
    import { register } from '@/routes'
    import { store } from '@/routes/login'
    import { request } from '@/routes/password'

    defineProps<{
        status?: string
        canResetPassword: boolean
        canRegister: boolean
    }>()

    const remember = ref(false)
</script>

<template>
    <Head title="Iniciar sesión" />

    <div class="grid min-h-svh lg:grid-cols-2 overflow-hidden bg-background text-foreground">
        <!-- LEFT -->
        <div class="flex flex-col gap-4 pt-0 px-6 pb-6 md:px-10 md:pb-10">
            <!-- Brand (solo desktop, en móvil va encima del cover) -->
            <div class="hidden lg:flex justify-center gap-2 pt-6">
                <Link href="/" class="flex items-center gap-2 font-medium transition hover:opacity-90">
                <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <GalleryVerticalEnd class="size-10" />
                </div>

                <span class="leading-tight">
                    <span class="block -mb-0.5 font-semibold tracking-tight">RSA</span>
                    <span class="block text-xl text-muted-foreground">Ingeniería Integral</span>
                </span>
                </Link>
            </div>

            <!-- Cover MOBILE: full width + buena altura + overlay neutral + brand encima -->
            <div class="relative lg:hidden -mx-6 md:-mx-10 -mt-0">
                <div class="relative w-full overflow-hidden rounded-none bg-muted h-72 sm:h-80">
                    <img :src="loginCoverMobile" alt="RSA cover mobile"
                    class="absolute inset-0 h-full w-full object-cover object-center"/>

                    <!-- Overlay neutral -->
                    <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-background/95" />

                    <!-- Brand encima (solo móvil) -->
                    <div class="absolute left-1/2 top-6 -translate-x-1/2">
                        <Link href="/" class="inline-flex items-center 
                        gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow-sm 
                        ring-1 ring-black/10 backdrop-blur
                        transition hover:bg-white/95 dark:bg-black/55 
                        dark:hover:bg-black/65 dark:ring-white/10">
                        <div class="flex h-7 w-7 items-center 
                        justify-center rounded-md bg-primary 
                        text-primary-foreground">
                            <GalleryVerticalEnd class="size-4" />
                        </div>

                        <span class="leading-tight">
                            <span class="block -mb-0.5 text-sm font-semibold tracking-tight">RSA</span>
                            <span class="block text-[11px] text-muted-foreground">Ingeniería Integral</span>
                        </span>
                        </Link>
                    </div>
                </div>
            </div>

            <!-- Center -->
            <div class="flex flex-1 items-start justify-center pt-6 lg:items-center lg:pt-0">
                <div class="w-full max-w-sm sm:max-w-md -mt-24 sm:-mt-28 lg:mt-0">
                    <!-- Card SOLO en móvil -->
                    <div class="rounded-3xl border bg-background/95 p-8 
                    shadow-xl backdrop-blur lg:rounded-none lg:border-0 
                    lg:bg-transparent lg:p-0 lg:shadow-none 
                    lg:backdrop-blur-0">
                        <div class="flex flex-col gap-6">
                            <!-- Heading -->
                            <div class="flex flex-col items-center gap-2 text-center">
                                <h1 class="text-2xl font-bold tracking-tight">Iniciar sesión</h1>
                                <p class="text-balance text-sm text-muted-foreground">
                                Ingresa tu correo y contraseña para acceder.
                                </p>
                            </div>

                            <!-- Status -->
                            <div v-if="status" class="rounded-lg border 
                            border-green-500/20 bg-green-500/10 px-3 py-2 
                            text-center text-sm font-medium text-green-600 
                            dark:text-green-400">
                                {{ status }}
                            </div>

                            <!-- Form -->
                            <Form v-bind="store.form()" 
                            :reset-on-success="['password']"
                            v-slot="{ errors, processing }"
                            class="grid gap-6">
                                <!-- Email -->
                                <div class="grid gap-2">
                                    <Label for="email">Correo electrónico</Label>
                                    <Input id="email" type="email" 
                                    name="email" required autofocus
                                    autocomplete="email"
                                    placeholder="m@ejemplo.com"
                                    :tabindex="1" class="transition 
                                    focus-visible:ring-2 
                                    focus-visible:ring-primary/40 
                                    focus-visible:ring-offset-2 
                                    focus-visible:ring-offset-background"/>
                                    <InputError :message="errors.email" />
                                </div>

                                <!-- Password -->
                                <div class="grid gap-2">
                                    <div class="flex items-center justify-between">
                                        <Label for="password">Contraseña</Label>

                                        <TextLink v-if="canResetPassword"
                                        :href="request()" class="text-sm 
                                        transition hover:text-foreground"
                                        :tabindex="5">
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    </div>

                                    <Input id="password" type="password"
                                    name="password" required
                                    autocomplete="current-password"
                                    placeholder="********"
                                    :tabindex="2" class="transition 
                                    focus-visible:ring-2 
                                    focus-visible:ring-primary/40 
                                    focus-visible:ring-offset-2 
                                    focus-visible:ring-offset-background"/>
                                    <InputError :message="errors.password" />
                                </div>

                                <!-- Remember -->
                                <div class="flex items-center gap-2">
                                    <Checkbox id="remember" 
                                    :checked="remember"
                                    @update:checked="remember = !!$event"
                                    :tabindex="3"/>
                                    <Label for="remember"
                                    class="cursor-pointer select-none 
                                    text-sm font-normal 
                                    text-muted-foreground 
                                    hover:text-foreground transition">
                                        Recordarme
                                    </Label>

                                    <input type="hidden" name="remember" :value="remember ? 'on' : ''" />
                                </div>

                                <!-- Submit -->
                                <Button type="submit"  class="w-full 
                                transition-all hover:-translate-y-[1px] 
                                hover:shadow-md 
                                disabled:hover:translate-y-0"
                                :tabindex="4" :disabled="processing"
                                data-test="login-button" >
                                    <Spinner v-if="processing" class="mr-2" />
                                    Iniciar sesión
                                </Button>

                                <!-- Register -->
                                <div v-if="canRegister" class="text-center text-sm text-muted-foreground">
                                    ¿No tienes una cuenta?
                                    <TextLink :href="register()" class="ml-1 transition hover:text-foreground" :tabindex="6">
                                        Registrarse
                                    </TextLink>
                                </div>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RIGHT (cover) desktop -->
        <div class="bg-muted relative hidden lg:block">
            <img :src="loginCoverDesktop" alt="RSA cover desktop"
            class="absolute inset-0 h-full w-full object-cover object-center"/>
            <!-- overlay leve opcional para look premium -->
            <div class="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/25" />
        </div>
    </div>
</template>