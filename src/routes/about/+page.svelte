<script lang="ts">
	import Heading_1 from "lucide-svelte/icons/heading-1";
</script>
<svelte:head>
    <title>ScrapeScribe - About</title>
</svelte:head>
<div class="flex-auto min-h-screen bg-gray-100 flex justify-center items-center p-6">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
        <p class="text-4xl font-bold border-b-4 border-black text-center tracking-wide pb-2">How to use ScrapeScribe</p>
        <div class="mt-6 space-y-4 text-lg text-gray-700">
            <p>First, enter your first name and create the endpoint that you want your API to be called (for example, /movies).</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/creatingEndpoint.png" alt="ScrapeScribe interface showing the 'Create' button">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Use the "Create" button to start</figcaption>
            </figure>
            <p>Then, open the document editor so you can modify the data fields in the API.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/docEditor.png" alt="ScrapeScribe document editor interface">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Document Editor with user-friendly UI</figcaption>
            </figure>
            <p>You can use the UI provided for a more structured and user-friendly experience or the JSON editor for more flexibility.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/jsonEditor.png" alt="ScrapeScribe JSON editor for API customization">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">JSON editor</figcaption>
            </figure>
            <p>Change the data type based on what is being scraped and how it will be used for your needs.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/changeDataType.png" alt="Selecting data types in ScrapeScribe">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Selection of data types for API scrapes</figcaption>
            </figure>
            <p>In the input field, paste the URL you wish to scrape data from, and ScrapeScribe will render the chosen website so you can select which elements you want.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/enteringURL.png" alt="Entering a URL in ScrapeScribe to begin scraping">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Enter the URL to get the page</figcaption>
            </figure>
            <p>Now, you are in the main scraping process, where you can select any HTML element to include in your API.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/selectingHTML.png" alt="Selecting HTML elements for data extraction in ScrapeScribe">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Select the HTML to scrape</figcaption>
            </figure>
            <p>After selecting all the data you want from the website, your API is now available and ready to use.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/copyingAPI.png" alt="Copying the generated API URL in ScrapeScribe">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Copy the URL of your API</figcaption>
            </figure>
            <p>Testing the API with Postman.</p>
            <figure class="max-w-lg mx-auto">
                <img class="h-auto max-w-full rounded-lg shadow-lg" src="/testingAPI.png" alt="Testing the API in Postman with a request">
                <figcaption class="mt-2 text-sm text-center text-gray-500 dark:text-gray-400">Use tools like Postman to test your own unique APIs</figcaption>
            </figure>
        </div>
    </div>
</div>
