import React, { useState, useEffect } from 'react';
import { getCountries } from "../data/countries.jsx";

import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

export async function loader() {
    const countries = await getCountries();
    return { countries };
}

const Root = () => {
    return (
        <div>
            <Breadcrumbs aria-label="breadcrumb">
                <Typography color="text.primary">Home</Typography>
            </Breadcrumbs>
            <h1>
                Home
            </h1>
            <h3>
                Welcome
            </h3>
        </div>
    );
}

export default Root;