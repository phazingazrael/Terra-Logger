---
title: "{{name}}"
aliases: "{{name}}"
tags: [infoBox, Location, City, {{name}}, {{capitalCity}}]
creation_date: <%+ tp.file.creation_date("dddd Do MMMM YYYY HH:mm:ss") %> 
modification_date: <%+ tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %>
isCapital: {{capital}}
cityFeatures: 
{{#Features}}
 - {{name}}
{{/Features}}
cityType: {{size}} 
population: {{populationout}}
country: {{country}}
{{capitalCityTag}}
---


```start-multi-column  
ID: City-{{name}}  
number of columns: 2  
largest column: left
border: off
shadow: off
```

#### Country: [[{{countryFull}}|{{countryFull}}]]

#### Population: {{populationout}}

{{citadelmd}}

{{capitalmd}}

{{portmd}}

{{plazamd}}

{{wallsmd}}

{{shantymd}}

{{templemd}}

{{linkmd}}


--- end-column ---
<html>
    <div class="infobox">
        <div class="heading">
            <h2>{{name}}</h2>
        </div>
    </div>
</html>

![[./{{name}}.svg|250]]

<html>
    <div class="infobox">
        <div class="infobox-group">
            <div class="heading">
                <h3>General Information</h3>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">plane</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">world</p>
                <ul class="data-content">
                    <li>Eatheria</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">country</p>
                <ul class="data-content">
                    <li>{{countryFull}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">region</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">traits</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="heading">
                <h3>City Information</h3>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Capital City</p>
                <ul class="data-content">
                    <li>{{capital}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">size</p>
                <ul class="data-content">
                    <li>{{size}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">population</p>
                <ul class="data-content">
                    <li>{{populationout}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">demographics</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">government</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">ruler</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">leader</p>
                <ul class="data-content">
                    <li></li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">culture</p>
                <ul class="data-content">
                    <li>{{culture}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Citadel</p>
                <ul class="data-content">
                    <li>{{citadel}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Capital</p>
                <ul class="data-content">
                    <li>{{capital}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Port</p>
                <ul class="data-content">
                    <li>{{port}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">plaza</p>
                <ul class="data-content">
                    <li>{{plaza}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">walls</p>
                <ul class="data-content">
                    <li>{{walls}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Shanty Town</p>
                <ul class="data-content">
                    <li>{{shanty}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">temple</p>
                <ul class="data-content">
                    <li>{{temple}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">map</p>
                <ul class="data-content">
                    <li>{{link}}</li>
                </ul>
            </div>
            <div class="heading">
				<h3>File Information</h3>
			</div>
			<div class="infobox-datarow">
				<p class="data-heading">File Created</p>
				<ul class="data-content">
					<li><%+ tp.file.creation_date("dddd Do MMMM YYYY HH:mm:ss") %></li>
				</ul>
			</div>
			<div class="infobox-datarow">
				<p class="data-heading">File Created</p>
				<ul class="data-content">
					<li><%+ tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %></li>
				</ul>
			</div>
        </div>
    </div>
</div>
</html>

=== end-multi-column