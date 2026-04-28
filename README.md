# Data Dashboards in React with Tremor

> **Note:** This project has been updated to React v18.3.1 with modernized dependencies.
> To see the original tutorial code, check out the [`react-v18.2.0`](https://github.com/colbyfayock/my-barbenheimer-dashboard/tree/react-v18.2.0) branch.

Demo for tutorial [Build Dashboards for Data Visualization in React with Tremor & Tailwind](https://www.youtube.com/watch?v=LAWjsToL7tQ)

📝 Article: https://spacejelly.dev/posts/how-to-build-data-dashboards-in-react-with-tremor-tailwind/

📺 YouTube: https://www.youtube.com/watch?v=LAWjsToL7tQ

🚀 Demo: https://my-barbenheimer-dashboard.vercel.app/

## Live weather + flight delay dashboard

This project now supports live data for:
- Weather and forecast: Open-Meteo APIs
- Flight delay metrics: Aviationstack Flights API

### Setup

1. Copy `.env.example` to `.env`
2. Add your Aviationstack key:

```bash
VITE_AVIATIONSTACK_API_KEY=your_aviationstack_key_here
```

3. Start the app:

```bash
npm run dev
```

If `VITE_AVIATIONSTACK_API_KEY` is missing, the dashboard still shows live weather but flight delay metrics remain at `0`.

## More tutorials and walkthroughs

🐦 [Follow me on Twitter](https://twitter.com/colbyfayock)

📺 [Subscribe on YouTube](https://kdta.io/MF13e)

✉️ [Sign Up for My Newsletter](https://colbyfayock.com/newsletter)
