<script lang="ts">
    import {goto} from '$app/navigation'
    import {onMount} from 'svelte'

    function navigateTo(path: string) {
        goto(path)
    }

    let codeLines = $state<string[]>([])
    let currentLineIndex = $state(0)
    const fullCodeLines = [
        "// ScrapeScribe API Endpoint",
        "GET /api/endpoint/123",
        "{",
        '  "title": "Latest Product",',
        '  "price": 129.99,',
        '  "available": true,',
        '  "updated": "2025-03-21T12:00:00Z",',
        '  "items": [',
        '    { "id": 1, "value": "Data" },',
        '    { "id": 2, "value": "From" },',
        '    { "id": 3, "value": "Web" }',
        '  ]',
        "}"
    ]


    onMount(() => {
        const typingInterval = setInterval(() => {
            if (currentLineIndex < fullCodeLines.length) {
                codeLines = [...codeLines, fullCodeLines[currentLineIndex]]
                currentLineIndex++
            } else {
                clearInterval(typingInterval)
            }
        }, 300)

        return () => clearInterval(typingInterval)
    })
</script>

<svelte:head>
    <title>ScrapeScribe - Transform Web Content into APIs</title>
</svelte:head>

<div class="flex flex-col h-screen bg-gradient-to-bl from-[#000826] via-[#000826] to-[#001032] text-[#F9F8EB] overflow-hidden relative">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMyNzEzQzAiIGZpbGwtb3BhY2l0eT0iMC4wMyIgZD0iTTM2IDM0aDJ2MmgtMnpNNDAgMzJoMnYtNmgtNnY2aDR6Ii8+PHBhdGggZmlsbD0iI0ZENUYwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIiBkPSJNMTIgMTBoMnYyaC0yek0xNiAxNGgydjJoLTJ6Ii8+PHBhdGggZmlsbD0iIzc3QjM5RCIgZmlsbC1vcGFjaXR5PSIwLjAyIiBkPSJNNDAgMjJoMnYyaC0yek0yNiA2aDJ2MmgtMnoiLz48L2c+PC9zdmc+')] opacity-40"></div>

    <div class="absolute top-20 right-10 w-80 h-80 bg-[#2713C0]/10 rounded-full blur-[100px] animate-pulse"></div>
    <div class="absolute bottom-10 left-20 w-96 h-96 bg-[#FD5F00]/5 rounded-full blur-[100px] animate-pulse"
         style="animation-delay: 1s;"></div>
    <div class="absolute top-40 left-1/4 w-64 h-64 bg-[#77B39D]/5 rounded-full blur-[80px] animate-pulse"
         style="animation-delay: 2s;"></div>

    <div class="particle-container absolute inset-0 z-0 overflow-hidden opacity-30">
        {#each Array(20) as _, i}
            <div
                    class="particle absolute rounded-full"
                    style="width: {Math.random() * 4 + 1}px; height: {Math.random() * 4 + 1}px;
                       background-color: {i % 3 === 0 ? '#FD5F00' : i % 3 === 1 ? '#2713C0' : '#77B39D'};
                       left: {Math.random() * 100}vw;
                       top: {Math.random() * 100}vh;
                       animation: float-particle {Math.random() * 10 + 20}s linear infinite,
                                  fade-in-out {Math.random() * 5 + 5}s ease-in-out infinite;
                       animation-delay: -{Math.random() * 20}s;">
            </div>
        {/each}
    </div>

    <header class="p-4 flex justify-between items-center z-10 relative">
        <div class="flex items-center">
            <div class="text-xl font-bold text-[#FD5F00] relative">
                <span class="relative z-10">ScrapeScribe</span>
                <span class="absolute -inset-1 opacity-50 bg-[#FD5F00]/10 blur-md rounded-full animate-pulse"></span>
            </div>
        </div>
        <nav>
            <ul class="flex space-x-6">
                <li>
                    <button
                            class="px-4 py-2 text-[#F9F8EB] border border-[#F9F8EB]/50 rounded hover:bg-[#F9F8EB]/10 transition-all hover:scale-105 backdrop-blur-sm"
                            onclick={() => navigateTo('/sign-in')}
                    >
                        Sign In
                    </button>
                </li>
                <li>
                    <button
                            class="px-4 py-2 bg-[#FD5F00] text-[#F9F8EB] rounded hover:bg-[#FD5F00]/90 transition-all hover:scale-105 shadow-md shadow-[#FD5F00]/20"
                            onclick={() => navigateTo('/sign-up')}
                    >
                        Sign Up
                    </button>
                </li>
            </ul>
        </nav>
    </header>

    <main class="flex-1 flex flex-col md:flex-row relative z-10 px-6 md:px-0">
        <div class="w-full md:w-1/2 flex flex-col justify-center px-4 md:px-16">
            <div class="relative">
                <h1 class="text-4xl font-bold mb-4">
                    Transform Web Into
                    <span class="text-[#FD5F00] inline-block relative">
                        APIs
                        <span class="absolute -inset-1 opacity-40 bg-[#FD5F00]/20 blur-md rounded-xl"></span>
                    </span>
                </h1>

                <div class="absolute -left-4 -top-4 w-16 h-16 bg-[#77B39D]/10 rounded-full blur-2xl animate-pulse-slow opacity-70"></div>
                <div class="absolute -right-4 -bottom-4 w-20 h-20 bg-[#2713C0]/10 rounded-full blur-2xl animate-pulse-slow opacity-70"
                     style="animation-delay: 1.5s;"></div>
            </div>

            <p class="text-lg mb-8 leading-relaxed text-[#F9F8EB]/90 backdrop-blur-sm">
                ScrapeScribe democratizes data access by enabling users to create custom API endpoints for websites
                lacking native APIs.
            </p>

            <p class="mb-8 leading-relaxed text-[#F9F8EB]/80 backdrop-blur-sm">
                Using an intuitive visual selection interface, transform static web content into dynamic, consumable
                JSON endpoints that update automatically on custom schedules.
            </p>

            <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-2">
                <button
                        class="px-6 py-3 bg-[#FD5F00] text-[#F9F8EB] rounded-lg hover:bg-[#FD5F00]/90 transition-all hover:shadow-lg hover:shadow-[#FD5F00]/20 hover:scale-105 relative overflow-hidden group"
                        onclick={() => navigateTo('/sign-up')}
                >
                    <span class="relative z-10">Get Started</span>
                    <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FD5F00]/0 via-[#F9F8EB]/20 to-[#FD5F00]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                </button>
                <button
                        class="px-6 py-3 bg-transparent border border-[#77B39D]/70 text-[#77B39D] rounded-lg hover:bg-[#77B39D]/10 transition-all hover:shadow-lg hover:shadow-[#77B39D]/10 hover:scale-105 backdrop-blur-sm"
                        onclick={() => navigateTo('/demo')}
                >
                    Try Demo
                </button>
            </div>
        </div>

        <div class="w-full md:w-1/2 flex items-center justify-center mt-8 md:mt-0">
            <div class="relative h-80 md:h-4/5 w-full md:w-4/5 animate-float">
                <div class="relative border border-[#F9F8EB]/20 bg-[#000826]/80 backdrop-blur-md h-full w-full rounded-xl p-6 overflow-hidden shadow-2xl shadow-[#000826]/50">
                    <div class="absolute top-0 left-0 right-0 h-10 bg-[#000826]/80 backdrop-blur-md border-b border-[#F9F8EB]/10 flex items-center px-4">
                        <div class="flex space-x-2">
                            <div class="w-3 h-3 rounded-full bg-[#FD5F00] animate-pulse-slow"></div>
                            <div class="w-3 h-3 rounded-full bg-[#77B39D] animate-pulse-slow"
                                 style="animation-delay: 0.5s;"></div>
                            <div class="w-3 h-3 rounded-full bg-[#F9F8EB]/50 animate-pulse-slow"
                                 style="animation-delay: 1s;"></div>
                        </div>
                        <div class="flex-1 text-center text-xs text-[#F9F8EB]/50">scrape-scribe-api</div>
                    </div>

                    <div class="mt-10 font-mono relative">
                        <div class="absolute -inset-6 bg-gradient-to-br from-[#2713C0]/5 via-[#FD5F00]/5 to-[#77B39D]/5 rounded-xl opacity-50 blur-xl"></div>

                        {#each codeLines as line, i}
                            <div class="line-appearing" style="animation-delay: {i * 100}ms">
                                {#if i === 0}
                                    <div class="text-[#77B39D]">{line}</div>
                                {:else if i === 1}
                                    <div class="text-[#F9F8EB]/70 mt-2">{line}</div>
                                {:else if i === 2 || i === codeLines.length - 1}
                                    <div class="text-[#FD5F00]">{line}</div>
                                {:else if i === 7 || i === 11}
                                    <div class="ml-4 text-[#2713C0]">{line}</div>
                                {:else if i >= 8 && i <= 10}
                                    <div class="ml-8 text-[#F9F8EB]/80">{line}</div>
                                {:else}
                                    <div class="ml-4 text-[#F9F8EB]/80">{line}</div>
                                {/if}
                            </div>
                        {/each}

                        {#if currentLineIndex < fullCodeLines.length}
                            <div class="h-5 w-2 bg-[#F9F8EB] inline-block ml-1 animate-blink"></div>
                        {/if}
                    </div>
                </div>

                <div class="absolute -inset-4 -z-10 bg-gradient-to-br from-[#FD5F00]/5 via-[#2713C0]/5 to-[#77B39D]/5 rounded-2xl blur-xl"></div>
            </div>
        </div>
    </main>

    <footer class="p-4 text-center text-[#F9F8EB]/60 relative z-10 backdrop-blur-sm">
        <nav class="mb-2">
            <ul class="flex justify-center flex-wrap space-x-2 md:space-x-6">
                <li>
                    <a href="/about" class="px-2 py-1 hover:text-[#FD5F00] transition-colors">About</a>
                </li>
                <li>
                    <a href="/demo" class="px-2 py-1 hover:text-[#FD5F00] transition-colors">Demo</a>
                </li>
                <li>
                    <a href="/docs" class="px-2 py-1 hover:text-[#FD5F00] transition-colors">Documentation</a>
                </li>
                <li>
                    <a href="/pricing" class="px-2 py-1 hover:text-[#FD5F00] transition-colors">Pricing</a>
                </li>
            </ul>
        </nav>
        <div class="text-sm">© 2025 ScrapeScribe. All rights reserved.</div>
    </footer>
</div>

<style>
    @keyframes float {
        0% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
        100% {
            transform: translateY(0px);
        }
    }

    @keyframes float-particle {
        0% {
            transform: translateY(0) translateX(0);
        }
        25% {
            transform: translateY(-20px) translateX(10px);
        }
        50% {
            transform: translateY(-40px) translateX(-10px);
        }
        75% {
            transform: translateY(-60px) translateX(10px);
        }
        100% {
            transform: translateY(-100vh) translateX(0);
        }
    }

    @keyframes fade-in-out {
        0%, 100% {
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
    }

    @keyframes blink {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0;
        }
    }

    @keyframes lineAppear {
        from {
            opacity: 0;
            transform: translateY(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes pulse-slow {
        0%, 100% {
            opacity: 0.3;
        }
        50% {
            opacity: 0.8;
        }
    }

    .animate-float {
        animation: float 6s ease-in-out infinite;
    }

    .animate-blink {
        animation: blink 1s step-end infinite;
    }

    .animate-pulse-slow {
        animation: pulse-slow 4s ease-in-out infinite;
    }

    .line-appearing {
        animation: lineAppear 0.5s ease-out forwards;
        opacity: 0;
    }

    .particle-container {
        pointer-events: none;
    }

    @media (max-width: 768px) {
        .animate-float {
            animation: none;
        }
    }
</style>
