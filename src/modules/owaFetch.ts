// function for custom URIEncoding
function customURIEncoding(str: string) {
    str = encodeURIComponent(str);
    str = str
        .replace("!", "%21")
        .replace("'", "%27")
        .replace("(", "%28")
        .replace(")", "%29")
        .replace("~", "%7E");
    return str;
}

// function to log msx.tu-dresden.de/owa/ and retrieve the .json containing information about EMails
export async function fetchOWA(username: string, password: string, logout: boolean) {
    // encodeURIComponent and encodeURI are not working for all chars. See documentation. Thats why I implemented custom encoding.
    username = customURIEncoding(username);
    password = customURIEncoding(password);

    // login
    await fetch("https://msx.tu-dresden.de/owa/auth.owa", {
        headers: {
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language":
                "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
            "cache-control": "max-age=0",
            "content-type": "application/x-www-form-urlencoded",
            "Access-Control-Allow-Origin": "*",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
        },
        referrer:
            "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa%2f%23authRedirect%3dtrue",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `destination=https%3A%2F%2Fmsx.tu-dresden.de%2Fowa%2F%23authRedirect%3Dtrue&flags=4&forcedownlevel=0&username=${username}%40msx.tu-dresden.de&password=${password}&passwordText=&isUtf8=1`,
        method: "POST",
        mode: "no-cors",
        credentials: "include",
    });

    const owaResp = await fetch("https://msx.tu-dresden.de/owa/", {
        headers: {
            accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language":
                "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
            "cache-control": "max-age=0",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "Access-Control-Allow-Origin": "*",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
        },
        referrer:
            "https://msx.tu-dresden.de/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmsx.tu-dresden.de%2fowa",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
    });

    const respText = await owaResp.text();
    const tmp = respText.split("window.clientId = '")[1];
    const clientId = tmp.split("'")[0];
    const corrId = clientId + "_" + new Date().getTime();
    //console.log("corrID: " + corrId);

    const mailInfoRsp = await fetch(
        "https://msx.tu-dresden.de/owa/sessiondata.ashx?appcacheclient=0",
        {
            headers: {
                accept: "*/*",
                "accept-language":
                    "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "Access-Control-Allow-Origin": "*",
                "sec-fetch-site": "same-origin",
                "x-owa-correlationid": corrId,
                "x-owa-smimeinstalled": "1",
            },
            referrer: "https://msx.tu-dresden.de/owa/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "POST",
            mode: "cors",
            credentials: "include",
        }
    );

    const mailInfoJson = await mailInfoRsp.json();

    // only logout, if user is not using owa in browser session
    if (logout) {
        console.log("Logging out from owa..");
        await fetch("https://msx.tu-dresden.de/owa/logoff.owa", {
            headers: {
                accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "accept-language":
                    "de-DE,de;q=0.9,en-DE;q=0.8,en-GB;q=0.7,en-US;q=0.6,en;q=0.5",
                "sec-fetch-dest": "document",
                "Access-Control-Allow-Origin": "*",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
            },
            referrer: "https://msx.tu-dresden.de/owa/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
            mode: "cors",
            credentials: "include",
        });
    }

    return mailInfoJson;
}

// extract number of unread messages in owa
export function countUnreadMsg(json: any) {
    console.log(json)
    const folder = json.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders.find(
            (obj) => obj.DisplayName === "Inbox" || obj.DisplayName === "Posteingang"
        );
    return folder.UnreadCount;
}
