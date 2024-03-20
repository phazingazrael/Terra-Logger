import { useRouteError } from "react-router-dom";
import { Typography } from "@mui/material";

export default function ErrorPage() {
    const error = useRouteError() as Error;
    console.error(error);

    return (
        <div id="error-page">
            <Typography color="text.primary">Error</Typography>
            <h3>Oops!</h3>
            <p>Sorry, an unexpected error has occurred.</p>
            <p>
                <i>{error.message}</i>
            </p>
        </div>
      )
}
