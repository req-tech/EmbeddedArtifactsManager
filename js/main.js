// Initialize GLOBAL variables
const widgetHandler = {
    selArtRef: [],
    availableLinks: [],
    targetContext: "base", // default context
    selectAllLinks: false,
};

// Subscribe to artifact selection event
RM.Event.subscribe(RM.Event.ARTIFACT_SELECTED, onSelection);

// Function to handle artifact selection event
function onSelection(artifacts) {
    widgetHandler.selArtRef = artifacts || [];
}

// Function to adjust the window height
function adjustHeight() {
    gadgets.window.adjustHeight();
}

// Function to execute when body loads
function onBodyLoad() {
    loadLanguage(); // Load the text according to the language file set in main.xml
    adjustHeight();
}

// Function to show or hide HTML elements
function toggleElementVisibility(elementId, displayStyle) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = displayStyle;
        adjustHeight();
    } else {
        console.error(`${elementId} not found`);
    }
}

// Function to toggle the visibility of a div and update button text
function toggleVisibility(divId, buttonId, showText, hideText) {
    const div = document.getElementById(divId);
    const button = document.getElementById(buttonId);
    if (div.classList.contains("hidden")) {
        div.classList.remove("hidden");
        button.innerHTML = hideText;
    } else {
        div.classList.add("hidden");
        button.innerHTML = showText;
    }
    adjustHeight();
}

// Function for Dev actions
async function devActions() {
    // console.log('Dev actions');
    // console.log('Artifact:', JSON.stringify(widgetHandler.selArtRef[0]));
    const responseData = await getAllArtifactsFromProject();
    // Loop through the results
    // console.log('Results:', responseData);
    // Iterate over each key-value pair in the response
    // for (const [key, value] of Object.entries(results)) {
    //     // Get the type information
    //     console.log('Key:', key);
    //     const typeInfo = value["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
        
    //     // Check if the type is "Requirement"
    //     if (typeInfo && Array.isArray(typeInfo)) {
    //         const isRequirement = typeInfo.some(
    //             item => item.value === "http://open-services.net/ns/rm#Requirement"
    //         );
    //         if (isRequirement) {
    //             console.log(`Requirement found: ${key}`);
    //         }
    //     }
    // }
    for (const key in responseData) {
        // console.log('Keyyy:', key);
        if (responseData.hasOwnProperty(key)) {
            const typeInfo = responseData[key]["http://www.w3.org/1999/02/22-rdf-syntax-ns#type"];
            
            // Check if the type matches "Requirement"
            if (typeInfo && Array.isArray(typeInfo)) {
                const isRequirement = typeInfo.some(
                    item => item.value === "http://open-services.net/ns/rm#Requirement"
                );
                if (isRequirement) {
                    console.log(`Requirement found: ${key}`);
                }
            }
        }
    }
}


// Function to get all artifacts from the entire project using OSLC
async function getAllArtifactsFromProject() {
    const projectUri = widgetHandler.selArtRef[0].componentUri;
    const projectUriParts = projectUri.split('/');
    const projectId = projectUriParts[projectUriParts.length - 1];
    const compUri = '_NO35cEqNEe-lXMAnwStbdQ'; //widgetHandler.selArtRef[0].componentUri;
    const project = '_Mks7EEqNEe-lXMAnwStbdQ';
    // console.log('Artifact:', JSON.stringify(widgetHandler.selArtRef[0]));

    try {
        // Get the current browser top level URL 
        const browserURLtop = window.parent.location.href;// Get the current browser URL
        const browserURL = window.location.href; // Get the current browser URL
        // console.log('Browser parent URL:', browserURLtop);
        const urlParts = browserURLtop.split('&');
        let componentUriOslc = '';
        if (urlParts[0].includes('showProjectDashboard')) {
            componentUriOslc = urlParts[1];
            console.log('Component OSLC:', componentUriOslc);
        }
        const url = new URL(browserURL);
        const baseUrl = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/rm`;

        console.log('Project ID:', projectId, 'Base URL:', baseUrl);
        console.log('componentUri:', widgetHandler.selArtRef[0].componentUri);

        // Construct the query URL
        const oslcQuery = "oslc.query=true";
        const projectURL = `projectURL=${encodeURIComponent(`${baseUrl}/process/project-areas/${projectId}`)}`;
        const componentUriEncoded = `componentURI=${encodeURIComponent(`https://clm.celeris.se/rm/rm-projects/${project}/components/${compUri}`)}`;
        // const componentUriEncoded = `componentURI=${encodeURIComponent(`https://clm.celeris.se/rm/rm-projects/${compUri}/components/${compUri}`)};
        const vvc = `&vvc.configuration=${encodeURIComponent(`https://clm.celeris.se/rm/cm/stream/${compUri}`)}`;
        //  const vvc = `&vvc.configuration=${encodeURIComponent(`https://clm.celeris.se/rm/cm/stream/${compUri}`)}`;
        const oslcPrefix = encodeURIComponent("oslc.prefix=dcterms=<http://purl.org/dc/terms/>,rm_nav=<http://jazz.net/ns/rm/navigation#>");
        const oslcWhere = encodeURIComponent('oslc.where=dcterms:identifier=534');
        // const oslcWhere = encodeURIComponent('oslc.where=dcterms:modified>"2020-08-01T21:51:40.979Z"^^xsd:datetime');
        const oslcSelect = encodeURIComponent("oslc.select=dcterms:identifier,dcterms:title");
        // const oslcPaging = encodeURIComponent("oslc.paging=true");
        // const oslcPageSize = encodeURIComponent("oslc.pageSize=200");
        const oslcPaging = "oslc.paging=true";
        const oslcPageSize = "oslc.pageSize=200";

        // let queryUrl = `${baseUrl}/views?${oslcQuery}&${componentUriEncoded}${vvc}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        let queryUrl = `${baseUrl}/views?${oslcQuery}&${componentUriOslc}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        // let queryUrl = `${baseUrl}/views?${oslcQuery}&${projectURL}&${oslcPrefix}&${oslcWhere}&${oslcSelect}&${oslcPaging}&${oslcPageSize}`;
        console.log('Query URL:', queryUrl);
        // queryUrl = 'https://homie.byte.fi:9443/rm/views?oslc.query=true&projectURL=https%3A%2F%2Fhomie.byte.fi%3A9443%2Frm%2Fprocess%2Fproject-areas%2F_22yKMJFmEe-Oy5UELFqR4Q&oslc.prefix=dcterms%3D%3Chttp%3A%2F%2Fpurl.org%2Fdc%2Fterms%2F%3E%2Crm_nav%3D%3Chttp%3A%2F%2Fjazz.net%2Fns%2Frm%2Fnavigation%23%3E&oslc.where=dcterms%3Amodified%3E%222020-08-01T21%3A51%3A40.979Z%22%5E%5Exsd%3Adatetime&oslc.select=dcterms%3Aidentifier%2Crm_nav%3Aparent&oslc.paging=true&oslc.pageSize=200';
        // alert('Curl  URL:' + queryUrl);

        // Perform the GET request
        const response = await fetch(queryUrl, {
            method: 'GET',
            headers: {
                // 'Accept': 'application/rdf+xml',
                'Accept': 'application/json',
                'OSLC-Core-Version': '3.0' // Update to the version used in the curl command
            },
            credentials: 'include' // Ensures cookies are sent along with the request
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response Error:', errorText);
            throw new Error(`Failed to fetch artifacts: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.text();
        // console.log('Response Data:', responseData);
        console.log('************************************     *************************************');

        // Assuming you have a function to parse RDF/XML
        // const artifacts = parseArtifactsFromRDF(responseData);
        return responseData;
    } catch (error) {
        console.error('Error while fetching project artifacts:', error);
        return [];
    }
}



// Placeholder function for parsing artifacts from RDF/XML
function parseArtifactsFromRDF(rdfData) {
    // Implement the parsing logic here to extract artifact references from RDF/XML response
    return [];
}

function createArtifactRef(uri, componentUri, moduleUri, format) {
    return new Promise((resolve, reject) => {
        try {
            const artifactRef = new RM.ArtifactRef(uri, componentUri, moduleUri, format);
            resolve(artifactRef);
        } catch (error) {
            reject(error);
        }
    });
}

async function getModule() {
    RM.Client.getCurrentArtifact(async function(res) {
        if (res.code !== RM.OperationResult.OPERATION_OK) {
            console.log('Error:', res);
            return;
        }
        const jsonObject = res;

        // Extract the format information
        const format = jsonObject.data?.ref?.format;
        const artifactFormat = jsonObject.data?.values["http://www.ibm.com/xmlns/rdm/types/ArtifactFormat"];
        
        // Check if it is of type "Module"
        if (format && format.endsWith("#Module") && artifactFormat === "Module") {
            console.log("This is a type of Module.");
        } else {
            alert("You are not in a Module View.");
            return;
        }
        const moduleUri = jsonObject.data?.ref?.uri;
        const moduleBinding = await getModuleBinding(moduleUri);
        const childBindings = moduleBinding[0]?.childBindings;
        const componentUri = jsonObject.data?.ref?.componentUri;
            
        // console.log('Module Binding:', JSON.stringify(childBindings));
        // Loop through the list using a for...of loop
        let artifactRef = [];
        for (const uri of childBindings) {
            // console.log('URI:', uri);
            // Create an ArtifactRef object
            const textArtifactRef = await createArtifactRef(uri, componentUri, moduleUri, 'Text');
            // const textArtifactRef = await new RM.ArtifactRef(uri, componentUri, moduleUri, 'Text');
            artifactRef.push(textArtifactRef);
            // const ress = await getArtifactWithEmbed(textArtifactRef);
            // if (ress) {
            //     // console.log('Embedded items:', JSON.stringify(ress.ref));
            //     // console.log('Artifact Ref:', JSON.stringify(textArtifactRef));
            //     // alert('Embedded items found in the Primary text.');
            //     artifactRef.push(textArtifactRef);
            // }
            // setContainerText("statusContainer", `Now ${artifactRef.length} artifacts.`);
        }
        // console.log('Artifact Ref:', JSON.stringify(artifactRef));
        // Loop through the list using a for...in loop  
        // for (const artifactWithEmbed of artifactRef) {
        //     console.log('Create links for Artifact:', artifactWithEmbed);
        //     // Pass artifactRef to readLinksButton_onclick
        await readLinksButton_onclick(artifactRef, moduleBinding);
        // }
    });
}

async function getArtifactWithEmbed(textArtifactRef) {
    return new Promise((resolve, reject) => {
        RM.Data.getAttributes(textArtifactRef, [RM.Data.Attributes.PRIMARY_TEXT, RM.Data.Attributes.FORMAT], function(ress) {
            // console.log('Response from getAttributes:', ress);
            if (!ress || !ress.data || !ress.data[0] || !ress.data[0].values) {
                console.error('Invalid response structure:', ress);
                resolve(null); // Skip to the next artifact
                return;
            }

            // Add text artifact reference to the list
            // console.log('Text Artifact:', JSON.stringify(ress));
            let primaryText = ress.data[0].values["http://www.ibm.com/xmlns/rdm/types/PrimaryText"];
            let title = ress.data[0].values["http://purl.org/dc/terms/title"];
            let format = ress.data[0].values["http://www.ibm.com/xmlns/rdm/types/ArtifactFormat"];
            // console.log('Title:', title);
            // console.log('Primary Text:', primaryText);
            // console.log('Format:', format);

            // Process Item if it is a Text artifact else skip
            if (format !== 'Text') {
                console.log('Artifact is not a Text artifact. Skipping...');
                resolve(null); // Skip to the next artifact
                return;
            } 

            // console.log('Artifact is a Text artifact. Processing...');
            // Create a URL pattern to match URLs in the text that can be Wrapped Artifacts
            const urlPattern = /https?:\/\/[^\s"'>]+/g;
            // Extract all URLs
            const urls = primaryText.match(urlPattern);
            // Check if the urls is not empty
            if (urls) {
                console.log('Embedded items found in the Primary text.');
                resolve(textArtifactRef);
            } else {
                resolve(null);
            }   
        });
    });
}


// Function to handle the Read Links button click, artifactRef is a list of artifact references
async function processArtifact(startRefUri, primaryText, componentUri, format, currentServer) {
    return new Promise(async (resolve, reject) => {
        try {
            let totalEmbeds = 0;
            // console.log('Artifact is a Text artifact. Processing...');
            // Create a URL pattern to match URLs in the text that can be Wrapped Artifacts
            const urlPattern = /https?:\/\/[^\s"'>]+/g;
            // Extract all URLs
            const urls = primaryText.match(urlPattern);
            // Check if the urls is not empty
            if (urls) {
                // Filter URLs to only include those from the same server and containing 'rm/wrappedResources'
                const filteredUrls = urls.filter(url => url.startsWith(currentServer) && url.toLowerCase().includes('rm/wrappedresources'));
                console.log('Found Wrapped items: ', filteredUrls.length);
                // Let's create Embeds links for the wrapped items
                // Loop through the filtered URLs
                for (let j = 0; j < filteredUrls.length; j++) {
                    // Get the URI of the wrapped item
                    const wrArtifactUri = filteredUrls[j].split('?')[0];
                    const targetUri = wrArtifactUri.replace('wrappedResources', 'resources');
                    // console.log('Wrapped Artifact URI:', targetUri);
                    // Create a new ArtifactRef object
                    
                    const textArtifactRef = new RM.ArtifactRef(startRefUri, componentUri, null, format);
                    console.log('Text Artifact Ref:', JSON.stringify(textArtifactRef));
                    const targetArtifactRef = new RM.ArtifactRef(targetUri, componentUri, null, 'WrapperResource');
                    console.log('Wrapped Artifact Ref:', JSON.stringify(targetArtifactRef));
                    // Create a Link between the Text Artifact and the Wrapped Artifact
                    try {
                        await updateLinkContext(textArtifactRef, RM.Data.LinkTypes.EMBEDS, targetArtifactRef);
                        totalEmbeds++;
                    } catch (error) {
                        console.error('Error updating link context:', error);
                        reject(error);
                    }
                }
            }
            resolve(totalEmbeds);
        } catch (error) {
            reject(error);
        }
    });
}

async function readArtifact(artifactRef) {
    return new Promise((resolve, reject) => {
        RM.Data.getAttributes(artifactRef, [RM.Data.Attributes.PRIMARY_TEXT, RM.Data.Attributes.FORMAT], function(res) {
            if (res.code !== RM.OperationResult.OPERATION_OK) {
                reportError(res);
                reject(res);
            } else {
                const format = res.data[0].values["http://www.ibm.com/xmlns/rdm/types/ArtifactFormat"];
                // console.log('Format:', format);
                if (format !== 'Text') {
                    console.log('Artifact is not a Text artifact. Skipping...');
                    resolve(null); // Resolve with null to indicate skipping
                } else {
                    const primaryText = res.data[0].values["http://www.ibm.com/xmlns/rdm/types/PrimaryText"];
                    // console.log('Response:', JSON.stringify(primaryText));
                    resolve(primaryText);
                }
            }
        });
    });
}
// Calling function
async function readLinksButton_onclick(artifactRef , moduleBinding) {
    setContainerText("statusContainer", 'Loading...');
    if (artifactRef.length === 0) {
        console.log('Processing selected artifacts.');
        artifactRef = widgetHandler.selArtRef;
    }

    if (!artifactRef || artifactRef.length === 0) {
        alert('No text artifacts selected.');
        return;
    }
    // Read module binding if not provided

    // console.log('Processing artifacts:', artifactRef.length);
    // counter for successful link creation and unsuccessful link creation
    let totalLinks = 0;
    let totalArtifacts = 0;
    let unsuccessfulLinks = 0;
    // Get the current server's origin (protocol, hostname, and port)
    const currentServer = window.location.origin;

    for (let i = 0; i < artifactRef.length; i++) {
        // console.log('Processing Artifact:', JSON.stringify(artifactRef[i]));
        try {
            if (moduleBinding.length === 0 && artifactRef[i].moduleUri) {
                const moduleUri = artifactRef[i].moduleUri;
                moduleBinding = await getModuleBinding(moduleUri);
            }
            // const artifactsWithEmbeds = [];
            const primaryText = await readArtifact(artifactRef[i]);

            if (!primaryText) {
                console.error('Primary text not found.');
                continue; // Skip to the next artifact
            }

            const startRef = artifactRef[i];
            let startUri = startRef.uri;
            // if module binding then get the bound artifact URI
            if (moduleBinding) { // This is the case when the selected Artifact is not Base artifact.
                startUri = getBoundArtifactUri(startRef.uri, moduleBinding);
            }   
            
            const embedsProcessed = await processArtifact(startUri, primaryText, startRef.componentUri, "Text", currentServer);
            totalLinks += embedsProcessed;
            totalArtifacts++;
            setContainerText("statusContainer", `Created ${totalLinks} links for ${totalArtifacts} artifacts scanned.`);
        } catch (error) {
            console.error('Error fetching attributes:', error);
            unsuccessfulLinks++;
        }
    }

    if (totalLinks === 0) {
        setContainerText("statusContainer", 'No embedded Artifacts without Embeds Link found.');
        return;
    }
}

// Function to read links of selected artifacts
async function readLinks(artifacts) {
    for (const artifact of artifacts) {
        // Get links of the artifact
        try {
            const links = await getLinks(artifact);
            widgetHandler.availableLinks.push(...links);
        } catch (error) {
            console.error('Error fetching links:', error);
            setContainerText("container", 'Error fetching links. Please check the artifact URI or permissions.');
        }
    }
    displayLinkOptions(widgetHandler.availableLinks);  
}

// Function to display link options as checkboxes
function displayLinkOptions(links) {
    const linkContainer = document.getElementById("linkContainer");
    const form = document.createElement("form");
    form.id = "linkOptionsForm";

    const linkTypeCount = {};
    links.forEach((link) => {
        if (link.art.moduleUri != null && link.linktype.direction !== '_OBJ') {
            // console.log('Link:', JSON.stringify(link));
            let linkTypeString = typeof link.linktype === 'object' ? link.linktype.uri.split('/').pop() : link.linktype;
            linkTypeString = linkTypeString === 'Link' ? 'Link To' : linkTypeString;

            if (!linkTypeCount[linkTypeString]) {
                linkTypeCount[linkTypeString] = [];
            }
            linkTypeCount[linkTypeString].push(link);
        }
    });

    // console.log('Link type count:', JSON.stringify(linkTypeCount));

    Object.entries(linkTypeCount).forEach(([linkType, linkGroup], index) => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `link_${index}`;
        checkbox.name = "link";
        checkbox.value = linkGroup.map((_, i) => i).join(","); // Store all indices of the links of the same type
        checkbox.classList.add("link-checkbox");
        checkbox.addEventListener("click", (e) => {
            e.stopPropagation();
            updateSelectAllCheckboxState();
        });

        const label = document.createElement("label");
        label.htmlFor = `link_${index}`;
        label.innerHTML = ` ${linkType} (${linkGroup.length})`;
        label.style.fontSize = "12px";

        const lineBreak = document.createElement("br");

        form.appendChild(checkbox);
        form.appendChild(label);
        form.appendChild(lineBreak);
    });

    if (Object.keys(linkTypeCount).length > 1) {
        const selectAllCheckbox = document.createElement("input");
        selectAllCheckbox.type = "checkbox";
        selectAllCheckbox.id = "selectAllLinksCheckbox";
        selectAllCheckbox.onclick = toggleSelectAllLinks;
    
        const selectAllLabel = document.createElement("label");
        selectAllLabel.htmlFor = "selectAllLinksCheckbox";
        selectAllLabel.innerHTML = " Select All Links";
        selectAllLabel.style.fontSize = "12px";
    
        const selectAllLineBreak = document.createElement("br");
    
        form.appendChild(selectAllCheckbox);
        form.appendChild(selectAllLabel);
        form.appendChild(selectAllLineBreak);
    }

    if (form.children.length === 0) {
        widgetHandler.availableLinks = [];
    }

    linkContainer.innerHTML = "";
    linkContainer.appendChild(form);

    adjustHeight();
    return form.length; 
}

// Function to handle the Convert Links button click
async function convertLinksButtonOnClick(removeModuleLinks) {
    console.log('Convert button clicked:', removeModuleLinks);
    const selectedLinks = getSelectedLinks();
    if (selectedLinks.length === 0) {
        setContainerText("container", 'No links selected for conversion.');
        return;
    }
    console.log('Selected links:', JSON.stringify(selectedLinks));

    let successfulConversions = 0;

    for (const selectedGroup of selectedLinks) {
        const linkIndices = selectedGroup.split(",").map(Number);
        for (const linkIndex of linkIndices) {
            const link = widgetHandler.availableLinks[linkIndex];
            const { art: { uri: existingStartUri, moduleUri }, targets, linktype } = link;
            console.log('Converting link:', JSON.stringify(link));

            const existingTargetUri = targets[0]?.uri;
            const targetModuleUri = targets[0]?.moduleUri;
            const { componentUri, format } = widgetHandler.selArtRef[0];

            if (existingTargetUri === existingStartUri) {
                console.error('Link target is same as source. Skipping link:', JSON.stringify(link));
                continue;
            }

            if (!existingTargetUri) {
                console.error('No target URI found for link:', JSON.stringify(link));
                continue;
            }

            try {
                const startBoundArtifactData = await getModuleBinding(moduleUri);
                const baseStartUri = getBoundArtifactUri(existingStartUri, startBoundArtifactData);
                const targetBoundArtifactData = await getModuleBinding(targetModuleUri);
                const baseTargetUri = getBoundArtifactUri(existingTargetUri, targetBoundArtifactData);
                const baseStartRef = new RM.ArtifactRef(baseStartUri, componentUri, null, format);
                const baseTargetRef = new RM.ArtifactRef(baseTargetUri, componentUri, null, format);
                await updateLinkContext(baseStartRef, linktype, baseTargetRef);
            } catch (error) {
                console.error('Error creating base links or fetching module binding for link target:', error);
                continue;
            }
            
            if (removeModuleLinks) {
                try {
                    const startRef = new RM.ArtifactRef(existingStartUri, componentUri, moduleUri, format);
                    const targetRef = new RM.ArtifactRef(existingTargetUri, componentUri, targetModuleUri, format);
                    await deleteModuleLinks(startRef, linktype, targetRef);
                } catch (error) {
                    console.error('Error deleting module links:', error);
                }
            }

            successfulConversions++;
        }
    }

    const statusMessage = `Converted ${successfulConversions} links out of ${selectedLinks.length} link types successfully.`;
    setContainerText("statusContainer", statusMessage);
    // Todo: Add a message to check if base links already existed
    // setContainerText("statusContainer", successfulConversions !== selectedLinks.length ? `${statusMessage} <br> Check if Base links already existed.` : statusMessage);
    
    toggleElementVisibility('reloadButton', 'block');
    toggleElementVisibility('convertButtonContainer', 'none');
}

// Function to update link context
async function updateLinkContext(start, linkType, target) {
    return new Promise((resolve, reject) => {
        RM.Data.createLink(start, linkType, target, function(response) {
            if (response.code !== RM.OperationResult.OPERATION_OK) {
                console.error('Error creating link:', response);
                reject(response);
            } else {
                console.log('Successfully created link between:', start, 'and', target);
                resolve();
            }
        });
    });
}

// Function to delete module links
async function deleteModuleLinks(start, linkType, target) {
    return new Promise((resolve, reject) => {
        RM.Data.deleteLink(start, linkType, target, function(response) {
            if (response.code !== RM.OperationResult.OPERATION_OK) {
                console.error('Error deleting link:', response);
                reject(response);
            } else {
                console.log('Successfully deleted link between:', start, 'and', target);
                resolve();
            }
        });
    });
}

// Function to get selected links
function getSelectedLinks() {
    const checkboxes = Array.from(document.querySelectorAll('#linkOptionsForm input[name="link"]:checked'));
    return checkboxes.map(checkbox => checkbox.value);
}

// Function to set container text
function setContainerText(containerId, string) {
    const container = document.getElementById(containerId);
    container.innerHTML = string;
    adjustHeight();
}

// Function to get module binding
function getModuleBinding(moduleUri) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch(`${moduleUri}/structure`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'DoorsRP-Request-Type': 'public 2.0'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                reject(new Error('Failed to fetch module binding. Response status: ' + response.status));
            } else {
                const data = await response.json();
                resolve(data);
            }
        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}

// Function to get bound artifact URI
function getBoundArtifactUri(artifactUri, moduleBindings) {
    const binding = moduleBindings.find(item => item.uri === artifactUri);
    if (binding && binding.boundArtifact) {
        return binding.boundArtifact;
    } else {
        throw new Error('No bound artifact found for the given artifact URI.');
    }
}

// Function to get links of an artifact
function getLinks(artifact) {
    return new Promise((resolve, reject) => {
        RM.Data.getLinkedArtifacts(artifact, function(response) {
            if (response && response.code === RM.OperationResult.OPERATION_OK) {
                // if response.data.artifactLinks.length is defined
                // console.log('Response:', JSON.stringify(response));
                if (response.data.artifactLinks.length === 0) {
                    // console.log('No links found for artifact:');
                    resolve([]);
                } else {
                // Filter out links with two words in the linktype.uri
                //     console.log('GetLinks:', JSON.stringify(response.data.artifactLinks.filter(link => {
                //     const words = link.linktype.uri.split(' ');
                //     return link.art.moduleUri != null && link.linktype.direction !== '_OBJ' && words.length === 1;
                // })));
                // resolve(response.data.artifactLinks.filter(link => {
                //     const words = link.linktype.uri.split(' ');
                //     return link.art.moduleUri != null && link.linktype.direction !== '_OBJ' && words.length === 1;
                // }));
                // console.log('GetLinks:', JSON.stringify(response.data.artifactLinks.filter(link => link.art.moduleUri != null && link.linktype.direction !== '_OBJ')));
                // TODO: link contains(' ')
                resolve(response.data.artifactLinks.filter(link => link.art.moduleUri != null && link.linktype.direction !== '_OBJ'));
                }

                // resolve(response.data.artifactLinks);
            } else {
                reject('Error fetching links. Please check the artifact URI or ensure the context is correct.');
            }
        });
    });
}

// Function to toggle the Select All Links checkbox
function toggleSelectAllLinks() {
    const selectAll = document.getElementById("selectAllLinksCheckbox").checked;
    document.querySelectorAll('input[name="link"]').forEach(checkbox => {
        checkbox.checked = selectAll;
    });
}

// Function to update the Select All checkbox state
function updateSelectAllCheckboxState() {
    const allChecked = Array.from(document.querySelectorAll('input[name="link"]')).every(checkbox => checkbox.checked);
    document.getElementById("selectAllLinksCheckbox").checked = allChecked;
}

// Function to handle Read All Links button click
async function readAllLinksButtonOnClick() {
    setContainerText("statusContainer", 'Loading...');
    widgetHandler.availableLinks = [];
    try {
        const response = await new Promise((resolve, reject) => {
            RM.Client.getCurrentArtifact(function(response) {
                if (response.code === RM.OperationResult.OPERATION_OK) {
                    resolve(response);
                } else {
                    reject('Error retrieving current artifact.');
                }
            });
        });

        if (response.data.values[RM.Data.Attributes.FORMAT] === "Module") {
            const res = await new Promise((resolve, reject) => {
                RM.Data.getContentsAttributes(response.data.ref, [RM.Data.Attributes.PRIMARY_TEXT, 'http://purl.org/dc/terms/identifier'], function(res) {
                    if (res.code === RM.OperationResult.OPERATION_OK) {
                        resolve(res);
                    } else {
                        reject('Error reading module contents.');
                    }
                });
            });
       
            widgetHandler.selArtRef = [res.data[0]];
            for (const artifact of res.data) {
                // console.log('Artifact:', JSON.stringify(artifact));
                try {
                    const links = await getLinks(artifact.ref);
                    widgetHandler.availableLinks.push(...links);
                } catch (error) {
                    console.error('Error fetching links:', error);
                }
            }
            
            // if (widgetHandler.availableLinks.length !== 0) {
                const formLength = displayLinkOptions(widgetHandler.availableLinks);
            if (formLength !== 0) {
                setContainerText("statusContainer", 'Select Link types to convert.');
                toggleElementVisibility('convertButtonContainer', 'block');
            } else {
                setContainerText("statusContainer", 'No outgoing Module links found in the module.');
                toggleElementVisibility('convertButtonContainer', 'none');
            }

        } else {
            alert('You are not in a Module.');
        }
    } catch (error) {
        alert(error);
    }
}
