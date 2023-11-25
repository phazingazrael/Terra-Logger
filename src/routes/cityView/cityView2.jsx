import React, { useState, useReducer, useEffect } from 'react';
import { useLoaderData } from "react-router-dom";
import { Link } from 'react-router-dom';

import MapBook from '~icons/gis/map-book.jsx';

import { Box, Button } from '@mui/material';

import EdiText from 'react-editext';

import { getCity } from "../../data/cities.jsx";
import { getCountry } from "../../data/countries.jsx";

import "./main.css";
import "./2.css";

export async function loader({ params }) {
    //console.log(params._id)
    console.log(params)
    const city = await getCity(params._id);
    //console.log(JSON.stringify(city))
    return { city };
}


const CityView = () => {
    const [editing, setEditing] = useState(false)
    const { city } = useLoaderData();


    const [_, forceUpdate] = useReducer((x) => x + 1, 0);

    const [mapData, setMap] = useState(
        JSON.parse(localStorage.getItem("mapParsed"))

    )

    const saveCity = (data) => {
        console.log('saving data');
        let Cities = JSON.parse(localStorage.getItem("cities"));
        let mapData = JSON.parse(localStorage.getItem("mapParsed"));
        let upd_obj = Cities.findIndex((obj => obj._id === data._id));
        let tMap = Cities;
        let toMap = mapData;
        tMap.splice(upd_obj, 1, data);
        toMap.Locations.cities.splice(upd_obj, 1, data);
        //localStorage.setItem("cities", JSON.stringify(tMap));
        //localStorage.setItem("mapParsed", JSON.stringify(toMap));
        setMap(toMap);
        forceUpdate();
        //console.log(data)
    }

    const delCity = (data) => {
        console.log('saving data');
        let Cities = JSON.parse(localStorage.getItem("cities"));
        let upd_obj = Cities.findIndex((obj => obj._id === data._id));
        let tMap = Cities;
        tMap.splice(upd_obj, 1,);
        localStorage.setItem("mapParsed", JSON.stringify(mapData));
        setMap();
        setMap(JSON.parse(localStorage.getItem("mapParsed")));
        setLoading(false);
    };

    let Countries = JSON.parse(localStorage.getItem("countries"));


    const country = Countries.filter(obj => {
        return obj._id === city.country._id
    })

    useEffect(() => {

        console.log(JSON.stringify(country))
        city.color = country.color;
        console.log(city);
        forceUpdate()
    }, []);

    return (
        <div>
            <Button variant="contained" onClick={() => {
                setEditing(e => !e)
            }}>Toggle Editing Mode</Button>
            <Button variant="contained" color="error" onClick={() => (
                setTimeout(5000,
                    delCity(element),
                    forceUpdate()
                )
            )}>Delete</Button>

            <Box className="contentMain" style={{ backgroundColor: 'rgba(193, 197, 195, 0.7)' }}>
                <main id="MAIN_1" className="mw-body">
                    <header className="mw-body-header vector-page-titlebar" id="HEADER_2">
                        <h1 id="H1_3" className="firstHeading mw-first-heading">
                            <span className="mw-page-title-main" id="SPAN_4">Chicago</span>
                        </h1>
                    </header>
                    <div id="DIV_5" className="vector-body ve-init-mw-desktopArticleTarget-targetContainer">
                        <div id="DIV_6" className="mw-body-content">
                            <div className="mw-content-ltr mw-parser-output" id="DIV_7">
                                <table className="infobox ib-settlement vcard" id="TABLE_11">
                                    <tbody id="TBODY_12">
                                        <tr id="TR_13">
                                            <th colspan="2" className="infobox-above" id="TH_14">
                                                <div className="fn org" id="DIV_15">
                                                    Chicago
                                                </div>
                                            </th>
                                        </tr>
                                        <tr id="TR_16">
                                            <td colspan="2" className="infobox-subheader" id="TD_17">
                                                <div className="category" id="DIV_18">
                                                    <a href="/wiki/List_of_municipalities_in_Illinois" title="List of municipalities in Illinois" id="A_19">City</a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_20">
                                            <td colspan="2" className="infobox-full-data" id="TD_21">
                                                COA Here
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_23">
                                            <th className="infobox-label" id="TH_24">
                                                Country
                                            </th>
                                            <td className="infobox-data" id="TD_25">
                                                United States
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_26">
                                            <th className="infobox-label" id="TH_27">
                                                State
                                            </th>
                                            <td className="infobox-data" id="TD_28">
                                                Illinois
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_29">
                                            <th className="infobox-label" id="TH_30">
                                                Counties
                                            </th>
                                            <td className="infobox-data" id="TD_31">
                                                <a href="/wiki/Cook_County,_Illinois" title="Cook County, Illinois" id="A_32">Cook</a> and <a href="/wiki/DuPage_County,_Illinois" title="DuPage County, Illinois" id="A_33">DuPage</a>
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_34">
                                            <th className="infobox-label" id="TH_35">
                                                Settled
                                            </th>
                                            <td className="infobox-data" id="TD_36">
                                                <abbr title="circa" id="ABBR_37">c.</abbr><span id="SPAN_38"> 1780<span className="noprint" id="SPAN_39">; 243 years ago</span> <span id="SPAN_40">(<span className="bday dtstart published updated" id="SPAN_41">1780</span>)</span></span>
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_42">
                                            <th className="infobox-label" id="TH_43">
                                                Founded by
                                            </th>
                                            <td className="infobox-data" id="TD_44">
                                                <a href="/wiki/Jean_Baptiste_Point_du_Sable" title="Jean Baptiste Point du Sable" id="A_45">Jean Baptiste Point du Sable</a>
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_46">
                                            <th colspan="2" className="infobox-header" id="TH_47">
                                                Government
                                                <div className="ib-settlement-fn" id="DIV_48">
                                                </div>
                                            </th>
                                        </tr>
                                        <tr className="mergedrow" id="TR_49">
                                            <th className="infobox-label" id="TH_50">
                                                • Type
                                            </th>
                                            <td className="infobox-data" id="TD_51">
                                                <a href="/wiki/Mayor%E2%80%93council_government" title="Mayor–council government" id="A_52">Mayor–council</a>
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_53">
                                            <th className="infobox-label" id="TH_54">
                                                • Body
                                            </th>
                                            <td className="infobox-data agent" id="TD_55">
                                                <a href="/wiki/Chicago_City_Council" title="Chicago City Council" id="A_56">Chicago City Council</a>
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_57">
                                            <th className="infobox-label" id="TH_58">
                                                • Mayor
                                            </th>
                                            <td className="infobox-data" id="TD_59">
                                                <a href="/wiki/Brandon_Johnson" title="Brandon Johnson" id="A_60">Brandon Johnson</a> (<a href="/wiki/Democratic_Party_(United_States)" title="Democratic Party (United States)" id="A_61">D</a>)
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_62">
                                            <th className="infobox-label" id="TH_63">
                                                • City Clerk
                                            </th>
                                            <td className="infobox-data" id="TD_64">
                                                <a href="/wiki/Anna_M._Valencia" title="Anna M. Valencia" id="A_65">Anna Valencia</a> (<a href="/wiki/Democratic_Party_(United_States)" title="Democratic Party (United States)" id="A_66">D</a>)
                                            </td>
                                        </tr>
                                        <tr className="mergedrow" id="TR_67">
                                            <th className="infobox-label" id="TH_68">
                                                • City Treasurer
                                            </th>
                                            <td className="infobox-data" id="TD_69">
                                                <a href="/wiki/Melissa_Conyears" className="mw-redirect" title="Melissa Conyears" id="A_70">Melissa Conyears-Ervin</a> (<a href="/wiki/Democratic_Party_(United_States)" title="Democratic Party (United States)" id="A_71">D</a>)
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_72">
                                            <th colspan="2" className="infobox-header" id="TH_73">
                                                Population
                                            </th>
                                        </tr>
                                        <tr className="mergedrow" id="TR_74">
                                            <th className="infobox-label" id="TH_75">
                                                • City
                                            </th>
                                            <td className="infobox-data" id="TD_76">
                                                2,746,388
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_77">
                                            <th className="infobox-label" id="TH_78">
                                                Moniker
                                            </th>
                                            <td className="infobox-data" id="TD_79">
                                                <a href="/wiki/Chicagoan" className="mw-redirect" title="Chicagoan" id="A_80">Chicagoan</a>
                                            </td>
                                        </tr>
                                        <tr className="mergedtoprow" id="TR_81">
                                            <th className="infobox-label" id="TH_82">
                                                Time zone
                                            </th>
                                            <td className="infobox-data" id="TD_83">
                                                <a href="/wiki/UTC%E2%88%9206:00" title="UTC−06:00" id="A_84">UTC−06:00</a> (<a href="/wiki/Central_Standard_Time" className="mw-redirect" title="Central Standard Time" id="A_85">CST</a>)
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p id="P_86">
                                    Description Here
                                </p>
                                <h2 id="H2_87">
                                    <span className="mw-headline" id="SPAN_88">Etymology and nicknames</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_89" />
                                <p id="P_90">
                                    Text Here
                                </p>
                                <h2 id="H2_91">
                                    <span className="mw-headline" id="SPAN_92">History</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_93" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_94" />
                                <h3 id="H3_95">
                                    <span className="mw-headline" id="SPAN_96">Beginnings</span>
                                </h3>
                                <p id="P_97">
                                    Text Here
                                </p>
                                <h3 id="H3_98">
                                    <span className="mw-headline" id="SPAN_99">19th century</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1096954695/mw-parser-output/.tmulti" id="LINK_100" />
                                <p id="P_101">
                                    Text Here
                                </p>
                                <h3 id="H3_102">
                                    <span className="mw-headline" id="SPAN_103">20th and 21st centuries</span>
                                </h3>
                                <h4 id="H4_104">
                                    <span className="mw-headline" id="SPAN_105">1900 to 1939</span>
                                </h4>
                                <p id="P_106">
                                    Text Here
                                </p>
                                <h4 id="H4_107">
                                    <span className="mw-headline" id="SPAN_108">1940 to 1979</span>
                                </h4>
                                <p id="P_109">
                                    Text Here
                                </p>
                                <h4 id="H4_110">
                                    <span className="mw-headline" id="SPAN_111">1980 to present</span>
                                </h4>
                                <p id="P_112">
                                    Text Here
                                </p>
                                <h2 id="H2_113">
                                    <span className="mw-headline" id="SPAN_114">Geography</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_115" />
                                <h3 id="H3_116">
                                    <span className="mw-headline" id="SPAN_117">Topography</span>
                                </h3>
                                <p id="P_118">
                                    Text Here
                                </p>
                                <h3 id="H3_119">
                                    <span className="mw-headline" id="SPAN_120">Communities</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_121" />
                                <p id="P_122">
                                    Text Here
                                </p>
                                <h3 id="H3_123">
                                    <span className="mw-headline" id="SPAN_124">Streetscape</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_125" />
                                <p id="P_126">
                                    Text Here
                                </p>
                                <h3 id="H3_127">
                                    <span className="mw-headline" id="SPAN_128">Architecture</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_129" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_130" />
                                <p id="P_131">
                                    Text Here
                                </p>
                                <h3 id="H3_132">
                                    <span className="mw-headline" id="SPAN_133">Monuments and public art</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_134" />
                                <p id="P_135">
                                    Text Here
                                </p>
                                <h3 id="H3_136">
                                    <span className="mw-headline" id="SPAN_137">Climate</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_138" />
                                <p id="P_139">
                                    Text Here
                                </p>
                                <div id="DIV_140">
                                    <p id="P_141">
                                        Table Here
                                    </p>
                                    <table className="wikitable" id="TABLE_142">
                                        <tbody id="TBODY_143">
                                            <tr id="TR_144">
                                                <th colspan="14" id="TH_145">
                                                    <button type="button" className="mw-collapsible-toggle mw-collapsible-toggle-default mw-collapsible-toggle-expanded" id="BUTTON_146">
                                                        <span className="mw-collapsible-text" id="SPAN_147">hide</span>
                                                    </button>Climate data for Chicago (<a href="/wiki/O%27Hare_International_Airport" title="O'Hare International Airport" id="A_148">O'Hare Int'l Airport</a>), 1991–2020 normals,<sup id="SUP_149" className="reference"><a href="#cite_note-Strange_field_expl-143" id="A_150">[a]</a></sup> extremes 1871–present<sup id="SUP_151" className="reference"><a href="#cite_note-149" id="A_152">[b]</a></sup>
                                                </th>
                                            </tr>
                                            <tr id="TR_153">
                                                <th id="TH_154">
                                                    Month
                                                </th>
                                                <th id="TH_155">
                                                    Jan
                                                </th>
                                                <th id="TH_156">
                                                    Year
                                                </th>
                                            </tr>
                                            <tr id="TR_157">
                                                <th id="TH_158">
                                                    Percent <a href="/wiki/Sunshine_duration" title="Sunshine duration" id="A_159">possible sunshine</a>
                                                </th>
                                                <td className="notheme" id="TD_160">
                                                    37
                                                </td>
                                            </tr>
                                            <tr id="TR_161">
                                                <td colspan="14" id="TD_162">
                                                    Source: <a href="/wiki/National_Oceanic_and_Atmospheric_Administration" title="National Oceanic and Atmospheric Administration" id="A_163">NOAA</a> (relative humidity, dew point and sun 1961–1990)<sup id="SUP_164" className="reference"><a href="#cite_note-NOAA-136" id="A_165">[136]</a></sup><sup id="SUP_166" className="reference"><a href="#cite_note-NOAA_ORD_TXT-150" id="A_167">[148]</a></sup><sup id="SUP_168" className="reference"><a href="#cite_note-NOAA_sun-151" id="A_169">[149]</a></sup>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <h3 id="H3_170">
                                    <span className="mw-headline" id="SPAN_171">Time zone</span>
                                </h3>
                                <p id="P_172">
                                    Text Here
                                </p>
                                <h2 id="H2_173">
                                    <span className="mw-headline" id="SPAN_174">Demographics</span>
                                </h2>

                                <p id="P_176">
                                    Text Here
                                </p>

                                <div className="div-col" id="DIV_178">
                                    <p id="P_179">
                                        Horizontal Unordered list
                                    </p><br id="BR_180" />
                                    <ul id="UL_181">
                                        <li id="LI_182">
                                            Ireland (137,799)
                                        </li>
                                        <li id="LI_183">
                                            West Indian (except Hispanic groups) (10,349)
                                        </li>
                                    </ul>
                                </div>
                                <h3 id="H3_184">
                                    <span className="mw-headline" id="SPAN_185">Religion</span>
                                </h3>
                                <p id="P_186">
                                    Text Here
                                </p>
                                <h2 id="H2_187">
                                    <span className="mw-headline" id="SPAN_188">Economy</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_189" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_190" />
                                <p id="P_191">
                                    Text Here
                                </p>
                                <h2 id="H2_192">
                                    <span className="mw-headline" id="SPAN_193">Culture and contemporary life</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_194" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_195" />
                                <p id="P_196">
                                    Text Here
                                </p>
                                <h3 id="H3_197">
                                    <span className="mw-headline" id="SPAN_198">Entertainment and the arts<span className="anchor" id="SPAN_199"></span></span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_200" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_201" />
                                <p id="P_202">
                                    Text Here
                                </p>
                                <h3 id="H3_203">
                                    <span className="mw-headline" id="SPAN_204">Tourism</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_205" />
                                <div className="hatnote navigation-not-searchable" id="DIV_206">
                                    Main article: <a href="/wiki/Tourism_in_Chicago" title="Tourism in Chicago" id="A_207">Tourism in Chicago</a>
                                </div>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_208" />
                                <p id="P_209">
                                    Text Here
                                </p>
                                <h3 id="H3_210">
                                    <span className="mw-headline" id="SPAN_211">Museums</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_212" />
                                <p id="P_213">
                                    Text Here
                                </p>
                                <h3 id="H3_214">
                                    <span className="mw-headline" id="SPAN_215">Cuisine</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_216" />
                                <p id="P_217">
                                    Text Here
                                </p>
                                <h3 id="H3_218">
                                    <span className="mw-headline" id="SPAN_219">Literature</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_220" />
                                <p id="P_221">
                                    Text Here
                                </p>
                                <h2 id="H2_222">
                                    <span className="mw-headline" id="SPAN_223">Sports</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_224" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1096954695/mw-parser-output/.tmulti" id="LINK_225" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1096954695/mw-parser-output/.tmulti" id="LINK_226" />
                                <p id="P_227">
                                    Text Here
                                </p>
                                <h2 id="H2_228">
                                    <span className="mw-headline" id="SPAN_229">Parks and greenspace</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_230" />
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1096954695/mw-parser-output/.tmulti" id="LINK_231" />
                                <p id="P_232">
                                    Text Here
                                </p>
                                <h2 id="H2_233">
                                    <span className="mw-headline" id="SPAN_234">Law and government</span>
                                </h2>
                                <h3 id="H3_235">
                                    <span className="mw-headline" id="SPAN_236">Government</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_237" />
                                <p id="P_238">
                                    Text Here
                                </p>
                                <h3 id="H3_239">
                                    <span className="mw-headline" id="SPAN_240">Politics</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_241" />
                                <p id="P_242">
                                    Text Here
                                </p>
                                <h3 id="H3_243">
                                    <span className="mw-headline" id="SPAN_244">Crime</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_245" />
                                <div className="hatnote navigation-not-searchable" id="DIV_246">
                                    Note for section
                                </div>
                                <figure className="mw-default-size" id="FIGURE_247">
                                    <p className="mw-file-description" id="P_248">
                                        <img src="//upload.wikimedia.org/wikipedia/commons/thumb/3/30/Chicago_Police_SUV.jpg/220px-Chicago_Police_SUV.jpg" width="220" height="165" className="mw-file-element" id="IMG_249" alt='' />
                                    </p>
                                    <figcaption id="FIGCAPTION_250">
                                        <p id="P_251">
                                            Text Here
                                        </p>
                                    </figcaption>
                                </figure>
                                <p id="P_252">
                                    Text Here
                                </p>
                                <h2 id="H2_253">
                                    <span className="mw-headline" id="SPAN_254">Education</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_255" />
                                <h3 id="H3_256">
                                    <span className="mw-headline" id="SPAN_257">Schools and libraries</span>
                                </h3>
                                <p id="P_258">
                                    Text Here
                                </p>
                                <h3 id="H3_259">
                                    <span className="mw-headline" id="SPAN_260">Colleges and universities</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_261" />
                                <p id="P_262">
                                    Text Here
                                </p>
                                <h2 id="H2_263">
                                    <span className="mw-headline" id="SPAN_264">Media</span>
                                </h2>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_265" />
                                <h3 id="H3_266">
                                    <span className="mw-headline" id="SPAN_267">Television</span>
                                </h3>
                                <p id="P_268">
                                    Text Here
                                </p>
                                <h4 id="H4_269">
                                    <span className="mw-headline" id="SPAN_270">Television stations</span>
                                </h4>
                                <p id="P_271">
                                    Text Here
                                </p>
                                <h3 id="H3_272">
                                    <span className="mw-headline" id="SPAN_273">Newspapers</span>
                                </h3>
                                <p id="P_274">
                                    Text Here
                                </p>
                                <h3 id="H3_275">
                                    <span className="mw-headline" id="SPAN_276">Movies and filming</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_277" />
                                <h3 id="H3_278">
                                    <span className="mw-headline" id="SPAN_279">Radio</span>
                                </h3>

                                <table className="box-Unreferenced_section plainlinks metadata ambox ambox-content ambox-Unreferenced" id="TABLE_281">
                                    <tbody id="TBODY_282">
                                        <tr id="TR_283">
                                            <td className="mbox-image" id="TD_284">
                                                <div className="mbox-image-div" id="DIV_285">
                                                    <span id="SPAN_286"><a href="/wiki/File:Question_book-new.svg" className="mw-file-description" id="A_287"><img alt="" src="//upload.wikimedia.org/wikipedia/en/thumb/9/99/Question_book-new.svg/50px-Question_book-new.svg.png" width="50" height="39" className="mw-file-element" id="IMG_288" /></a></span>
                                                </div>
                                            </td>
                                            <td className="mbox-text" id="TD_289">
                                                <div className="mbox-text-span" id="DIV_290">
                                                    <p id="P_291">
                                                        Text Here
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p id="P_292">
                                    Text Here
                                </p>
                                <h2 id="H2_293">
                                    <span className="mw-headline" id="SPAN_294">Infrastructure</span>
                                </h2>
                                <h3 id="H3_295">
                                    <span className="mw-headline" id="SPAN_296">Transportation</span>
                                </h3>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_297" />
                                <p id="P_298">
                                    Text HereText Here
                                </p>
                                <h4 id="H4_300">
                                    <span className="mw-headline" id="SPAN_301">Parking</span>
                                </h4>
                                <p id="P_302">
                                    Text Here
                                </p>
                                <h4 id="H4_303">
                                    <span className="mw-headline" id="SPAN_304">Expressways</span>
                                </h4>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_305" />
                                <p id="P_306">
                                    Text Here
                                </p>
                                <h4 id="H4_307">
                                    <span className="mw-headline" id="SPAN_308">Transit systems</span>
                                </h4>
                                <p id="P_309">
                                    Text Here
                                </p>
                                <ul id="UL_310">
                                    <li id="LI_311">
                                        List Item Here, Can be LARGE AF
                                    </li>
                                </ul>
                                <p id="P_312">
                                    Text Here
                                </p>
                                <h4 id="H4_313">
                                    <span className="mw-headline" id="SPAN_314">Passenger rail</span>
                                </h4>
                                <p id="P_315">
                                    Text Here
                                </p>
                                <h4 id="H4_316">
                                    <span className="mw-headline" id="SPAN_317">Bicycle and scooter sharing systems</span>
                                </h4>
                                <p id="P_318">
                                    Text Here
                                </p>
                                <h4 id="H4_319">
                                    <span className="mw-headline" id="SPAN_320">Freight rail</span>
                                </h4>
                                <p id="P_321">
                                    Text Here
                                </p>
                                <h4 id="H4_322">
                                    <span className="mw-headline" id="SPAN_323">Airports</span>
                                </h4>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_324" />
                                <p id="P_325">
                                    Text Here
                                </p>
                                <h4 id="H4_326">
                                    <span className="mw-headline" id="SPAN_327">Port authority</span>
                                </h4>
                                <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1033289096" id="LINK_328" />
                                <p id="P_329">
                                    Text Here
                                </p>
                                <h3 id="H3_330">
                                    <span className="mw-headline" id="SPAN_331">Utilities</span>
                                </h3>
                                <p id="P_332">
                                    Text Here
                                </p>
                                <h3 id="H3_333">
                                    <span className="mw-headline" id="SPAN_334">Health systems</span>
                                </h3>
                                <p id="P_335">
                                    Text Here
                                </p>
                                <div className="navbox-styles" id="DIV_336">
                                    <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1061467846" id="LINK_337" />
                                </div>

                                <div className="portal-bar noprint metadata noviewer portal-bar-bordered" id="DIV_339">
                                    <span className="portal-bar-header" id="SPAN_340"><a href="/wiki/Wikipedia:Contents/Portals" title="Wikipedia:Contents/Portals" id="A_341">Portals</a>:</span>
                                    <ul className="portal-bar-content" id="UL_342">
                                        <li className="portal-bar-item" id="LI_343">
                                            <span id="SPAN_344"><span id="SPAN_345"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Seal_of_Chicago%2C_Illinois.svg/19px-Seal_of_Chicago%2C_Illinois.svg.png" width="19" height="19" className="mw-file-element" id="IMG_346" /></span></span> <a href="/wiki/Portal:Chicago" title="Portal:Chicago" id="A_347">Chicago</a>
                                        </li>
                                        <li className="portal-bar-item" id="LI_348">
                                            <span className="mw-image-border" id="SPAN_349"><span id="SPAN_350"><img alt="flag" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Illinois.svg/21px-Flag_of_Illinois.svg.png" width="21" height="13" className="mw-file-element" id="IMG_351" /></span></span> <a href="/wiki/Portal:Illinois" title="Portal:Illinois" id="A_352">Illinois</a>
                                        </li>
                                        <li className="portal-bar-item" id="LI_353">
                                            <span id="SPAN_354"><span id="SPAN_355"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/b/b5/COL-city_icon.png/19px-COL-city_icon.png" width="19" height="19" className="mw-file-element" id="IMG_356" /></span></span> <a href="/wiki/Portal:Cities" title="Portal:Cities" id="A_357">Cities</a>
                                        </li>
                                        <li className="portal-bar-item" id="LI_358">
                                            <span className="mw-image-border" id="SPAN_359"><span id="SPAN_360"><img alt="flag" src="//upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/21px-Flag_of_the_United_States.svg.png" width="21" height="11" className="mw-file-element" id="IMG_361" /></span></span> <a href="/wiki/Portal:United_States" title="Portal:United States" id="A_362">United States</a>
                                        </li>
                                    </ul>
                                </div>

                                <div className="noprint metadata sister-bar" id="DIV_364">
                                    <div className="sister-bar-header" id="DIV_365">
                                        <b>Chicago</b> at Wikipedia's <a href="/wiki/Wikipedia:Wikimedia_sister_projects" title="Wikipedia:Wikimedia sister projects" id="A_367"><span id="SPAN_368">sister projects</span></a>:
                                    </div>
                                    <ul className="sister-bar-content" id="UL_369">
                                        <li className="sister-bar-item" id="LI_370">
                                            <span className="sister-bar-logo" id="SPAN_371"><span id="SPAN_372"><span id="SPAN_373"><img alt="" src="//upload.wikimedia.org/wikipedia/en/thumb/0/06/Wiktionary-logo-v2.svg/19px-Wiktionary-logo-v2.svg.png" width="19" height="19" className="mw-file-element" id="IMG_374" /></span></span></span><span className="sister-bar-link" id="SPAN_375"><b id="B_376"><a href="https://en.wiktionary.org/wiki/Special:Search/Chicago" className="extiw" title="wikt:Special:Search/Chicago" id="A_377">Definitions</a></b> from Wiktionary</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_378">
                                            <span className="sister-bar-logo" id="SPAN_379"><span id="SPAN_380"><span id="SPAN_381"><img alt="" src="//upload.wikimedia.org/wikipedia/en/thumb/4/4a/Commons-logo.svg/14px-Commons-logo.svg.png" width="14" height="19" className="mw-file-element" id="IMG_382" /></span></span></span><span className="sister-bar-link" id="SPAN_383"><b id="B_384"><a href="https://commons.wikimedia.org/wiki/Chicago" className="extiw" title="c:Chicago" id="A_385">Media</a></b> from Commons</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_386">
                                            <span className="sister-bar-logo" id="SPAN_387"><span id="SPAN_388"><span id="SPAN_389"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/2/24/Wikinews-logo.svg/21px-Wikinews-logo.svg.png" width="21" height="11" className="mw-file-element" id="IMG_390" /></span></span></span><span className="sister-bar-link" id="SPAN_391"><b id="B_392"><a href="https://en.wikinews.org/wiki/Category:Chicago,_Illinois" className="extiw" title="n:Category:Chicago, Illinois" id="A_393">News</a></b> from Wikinews</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_394">
                                            <span className="sister-bar-logo" id="SPAN_395"><span id="SPAN_396"><span id="SPAN_397"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wikiquote-logo.svg/16px-Wikiquote-logo.svg.png" width="16" height="19" className="mw-file-element" id="IMG_398" /></span></span></span><span className="sister-bar-link" id="SPAN_399"><b id="B_400"><a href="https://en.wikiquote.org/wiki/Chicago" className="extiw" title="q:Chicago" id="A_401">Quotations</a></b> from Wikiquote</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_402">
                                            <span className="sister-bar-logo" id="SPAN_403"><span id="SPAN_404"><span id="SPAN_405"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Wikisource-logo.svg/18px-Wikisource-logo.svg.png" width="18" height="19" className="mw-file-element" id="IMG_406" /></span></span></span><span className="sister-bar-link" id="SPAN_407"><b id="B_408"><a href="https://en.wikisource.org/wiki/Special:Search/Chicago" className="extiw" title="s:Special:Search/Chicago" id="A_409">Texts</a></b> from Wikisource</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_410">
                                            <span className="sister-bar-logo" id="SPAN_411"><span id="SPAN_412"><span id="SPAN_413"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wikibooks-logo.svg/19px-Wikibooks-logo.svg.png" width="19" height="19" className="mw-file-element" id="IMG_414" /></span></span></span><span className="sister-bar-link" id="SPAN_415"><b id="B_416"><a href="https://en.wikibooks.org/wiki/Special:Search/Chicago" className="extiw" title="b:Special:Search/Chicago" id="A_417">Textbooks</a></b> from Wikibooks</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_418">
                                            <span className="sister-bar-logo" id="SPAN_419"><span id="SPAN_420"><span id="SPAN_421"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Wikiversity_logo_2017.svg/21px-Wikiversity_logo_2017.svg.png" width="21" height="17" className="mw-file-element" id="IMG_422" /></span></span></span><span className="sister-bar-link" id="SPAN_423"><b id="B_424"><a href="https://en.wikiversity.org/wiki/Special:Search/Chicago" className="extiw" title="v:Special:Search/Chicago" id="A_425">Resources</a></b> from Wikiversity</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_426">
                                            <span className="sister-bar-logo" id="SPAN_427"><span id="SPAN_428"><span id="SPAN_429"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wikivoyage-Logo-v3-icon.svg/19px-Wikivoyage-Logo-v3-icon.svg.png" width="19" height="19" className="mw-file-element" id="IMG_430" /></span></span></span><span className="sister-bar-link" id="SPAN_431"><b id="B_432"><a href="https://en.wikivoyage.org/wiki/Chicago" className="extiw" title="voy:Chicago" id="A_433">Travel guides</a></b> from Wikivoyage</span>
                                        </li>
                                        <li className="sister-bar-item" id="LI_434">
                                            <span className="sister-bar-logo" id="SPAN_435"><span id="SPAN_436"><span id="SPAN_437"><img alt="" src="//upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Wikidata-logo.svg/21px-Wikidata-logo.svg.png" width="21" height="12" className="mw-file-element" id="IMG_438" /></span></span></span><span className="sister-bar-link" id="SPAN_439"><b id="B_440"><a href="https://www.wikidata.org/wiki/Q1297" className="extiw" title="d:Q1297" id="A_441">Data</a></b> from Wikidata</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </Box>
        </div>
    );
}

export default CityView;