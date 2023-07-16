---
title: "{{name}}"
aliases: "{{name}}"
tags: [infoBox, Religion, {{name}}, Faction]
type: [ReligiousGroup, Religious Faction]
affilliation: 
creation_date: <%+ tp.file.creation_date("dddd Do MMMM YYYY HH:mm:ss") %> 
modification_date: <%+ tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %>
---


```start-multi-column  
ID: Religion-{{code}}  
number of columns: 2  
largest column: left
border: off
shadow: off
```

### {{name}}

#### Type: {{type}}

#### Form: {{form}}

#### Code: {{code}}

#### **Color:** {{color}}

--- end-column ---
<html>
    <div class="infobox">
        <div class="heading">
            <h2>{{name}}</h2>
        </div>
        <div class="infobox-group">
            <div class="heading">
                <h3>{{name}}</h3>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">world</p>
                <ul class="data-content">
                    <li>Eatheria</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Religion Type</p>
                <ul class="data-content">
                    <li>{{type}}</li>
                    <li>{{form}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Deity</p>
                <ul class="data-content">
                    <li>{{deity}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">Memberbase</p>
                <ul class="data-content">
                    <li>Urban: {{urbanPop}}</li>
                    <li>Rural: {{ruralPop}}</li>
                </ul>
            </div>
            <div class="infobox-datarow">
                <p class="data-heading">leader</p>
                <ul class="data-content">
                    <li></li>
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