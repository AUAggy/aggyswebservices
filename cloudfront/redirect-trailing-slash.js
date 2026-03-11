function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (request.method !== "GET" && request.method !== "HEAD") {
    return request;
  }

  if (uri === "/" || uri.endsWith("/")) {
    return request;
  }

  if (uri.indexOf(".") !== -1) {
    return request;
  }

  var querystring = request.querystring || {};
  var parts = [];
  for (var key in querystring) {
    if (!Object.prototype.hasOwnProperty.call(querystring, key)) continue;
    var entry = querystring[key];
    if (entry && typeof entry.value === "string") {
      parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(entry.value));
    } else {
      parts.push(encodeURIComponent(key));
    }
  }
  var query = parts.length ? "?" + parts.join("&") : "";

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: uri + "/" + query },
      "cache-control": { value: "public, max-age=3600" },
    },
  };
}
