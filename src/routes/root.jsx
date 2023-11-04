import React, { useState, useEffect } from 'react';
import { getCountries } from "../data/countries.jsx";

export async function loader() {
    const countries = await getCountries();
    return { countries };
}

const Root = () => {
    return (
        <div>
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