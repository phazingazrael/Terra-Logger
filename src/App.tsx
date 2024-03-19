import Package from "../package.json";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import Settings from "./pages/Settings";

import "./App.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        // errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <HomePage />,
                // errorElement: <ErrorPage />,
            },
            // {
            //     path: "overview",
            //     element: <Overview />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "cities",
            //     element: <Cities />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "countries",
            //     element: <Countries />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "entries",
            //     element: <Entries />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "religions",
            //     element: <Religions />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "tags",
            //     element: <Tags />,
            //     errorElement: <ErrorPage />,
            // },
            {
                path: "settings",
                element: <Settings {...Package} />,
                //     errorElement: <ErrorPage />,
            },
            // {
            //     path: "view_city",
            //     element: <ViewCity />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "view_country/:_id",
            //     element: <ViewCountry />,
            //     errorElement: <ErrorPage />,
            // },
            // {
            //     path: "view_country",
            //     element: <ViewCountry />,
            //     errorElement: <ErrorPage />,
            // },
        ],
    },
]);

const App = () => {
    return (
        <div>
            <RouterProvider router={router} />
        </div>
    );
};

export default App;
