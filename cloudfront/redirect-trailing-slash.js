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

  var query = request.querystring ? "?" + request.querystring : "";

  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: uri + "/" + query },
      "cache-control": { value: "public, max-age=3600" },
    },
  };
}
