import { useRouteError } from "react-router-dom";

import { Typography, Breadcrumbs } from '@mui/joy';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <Breadcrumbs aria-label="breadcrumb">
        <Typography color="text.primary">Error</Typography>
      </Breadcrumbs>
      <h3>Oops!</h3>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  );
}