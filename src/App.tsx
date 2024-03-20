import Package from "../package.json";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import {HomePage, ErrorPage, Settings, Overview, Tags} from "./pages";

import "./App.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <HomePage />,
                errorElement: <ErrorPage />,
            },
            {
                path: "overview",
                element: <Overview />,
                errorElement: <ErrorPage />,
            },
            {
                path: "tags",
                element: <Tags />,
                errorElement: <ErrorPage />,
            },
            {
                path: "settings",
                element: <Settings {...Package} />,
                errorElement: <ErrorPage />,
            }
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
