import * as React from 'react';

const UploadForm = () => {

    const readJSON = (e) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            let result = e.target.result;
            localStorage.setItem("mapParsed", result);
        };
    }

    return (
        <div className="uploadForm">
            <h5>Uh Oh, Looks like there isn't anything loaded, Want to load an exported map.json file?</h5>
            <div>
                <label htmlFor="upload">
                    Upload File:
                </label>
                <input
                    type="file"
                    name="upload"
                    id="upload"
                    accept='.json'
                    onChange={readJSON}
                />
            </div >
        </div >
    );
}

export default UploadForm;
