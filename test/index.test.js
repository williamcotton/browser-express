const assert = require("assert");
const express = require("../src/index");

describe("browser-express additional tests", () => {
  let app;

  beforeEach(async () => {
    if (app) {
      window.history.pushState("/", null, "/");
      await app.close();
    }
    app = express();
    await app.listen({}, () => {});
  });

  afterEach(async () => {
    await app.close();
  });

  it("handles multiple middleware functions", async () => {
    let middlewareCount = 0;

    app.use((req, res, next) => {
      middlewareCount++;
      next();
    });

    app.use((req, res, next) => {
      middlewareCount++;
      next();
    });

    app.get("/test-middleware", (req, res) => {
      assert.equal(middlewareCount, 2);
      res.send("Middleware test passed");
    });

    await app.navigate("/test-middleware");
  });

  it("handles GET requests with route parameters", async () => {
    app.get("/user/:id/profile/:section", (req, res) => {
      assert.equal(req.params.id, "123");
      assert.equal(req.params.section, "about");
      res.send("Route parameters test passed");
    });

    await app.navigate("/user/123/profile/about");
  });

  it("handles GET requests with query parameters", async () => {
    app.get("/search", (req, res) => {
      assert.equal(req.query.q, "test query");
      assert.equal(req.query.page, "2");
      res.send("Query parameters test passed");
    });

    await app.navigate("/search?q=test%20query&page=2");
  });

  it("handles POST requests with JSON body", async () => {
    app.post("/api/data", (req, res) => {
      assert.deepEqual(req.body, { name: "John Doe", age: 30 });
      res.send("POST with JSON body test passed");
    });

    await app.submit("/api/data", "post", { name: "John Doe", age: 30 });
  });

  it("handles PUT requests", async () => {
    app.put("/api/update/:id", (req, res) => {
      assert.equal(req.params.id, "456");
      assert.deepEqual(req.body, { status: "updated" });
      res.send("PUT request test passed");
    });

    await app.submit("/api/update/456", "put", { status: "updated" });
  });

  it("handles DELETE requests", async () => {
    app.delete("/api/remove/:id", (req, res) => {
      assert.equal(req.params.id, "789");
      res.send("DELETE request test passed");
    });

    await app.submit("/api/remove/789", "delete");
  });

  it("handles redirects", async () => {
    app.get("/redirect", (req, res) => {
      res.redirect("/target");
    });

    app.get("/target", (req, res) => {
      res.send("Redirect test passed");
    });

    await app.navigate("/redirect");
    assert.equal(window.location.pathname, "/target");
  });

  it("handles 404 Not Found", async () => {
    app.use((req, res, next) => {
      res.status(404).send("404 Not Found");
    });

    await app.navigate("/non-existent-route");
    assert.equal(document.body.innerHTML, "404 Not Found");
  });

  it("handles error middleware", async () => {
    app.get("/error", (req, res, next) => {
      next(new Error("Test error"));
    });

    app.use((err, req, res, next) => {
      res.status(500).send(`Error: ${err.message}`);
    });

    await app.navigate("/error");
    assert.equal(document.body.innerHTML, "Error: Test error");
  });

  it("handles chained route handlers", async () => {
    app
      .route("/api/resource")
      .get((req, res) => {
        res.send("GET resource");
      })
      .post((req, res) => {
        res.send("POST resource");
      })
      .put((req, res) => {
        res.send("PUT resource");
      });

    await app.navigate("/api/resource");
    assert.equal(document.body.innerHTML, "GET resource");

    await app.submit("/api/resource", "post");
    assert.equal(document.body.innerHTML, "POST resource");

    await app.submit("/api/resource", "put");
    assert.equal(document.body.innerHTML, "PUT resource");
  });

  it("respects route order", async () => {
    app.get("/order/specific", (req, res) => {
      res.send("Specific route");
    });

    app.get("/order/:param", (req, res) => {
      res.send("Param route");
    });

    await app.navigate("/order/specific");
    assert.equal(document.body.innerHTML, "Specific route");

    await app.navigate("/order/other");
    assert.equal(document.body.innerHTML, "Param route");
  });

  it("handles multiple route parameters", async () => {
    app.get("/multi/:param1/:param2/:param3", (req, res) => {
      res.send(
        `${req.params.param1}-${req.params.param2}-${req.params.param3}`
      );
    });

    await app.navigate("/multi/one/two/three");
    assert.equal(document.body.innerHTML, "one-two-three");
  });

  it("handles query parameters with multiple values", async () => {
    app.get("/multi-query", (req, res) => {
      res.send(`${req.query.key.join(",")}`);
    });

    await app.navigate("/multi-query?key=value1&key=value2&key=value3");
    assert.equal(document.body.innerHTML, "value1,value2,value3");
  });

  it("handles middleware that modifies the request", async () => {
    app.use((req, res, next) => {
      req.customProperty = "Modified by middleware";
      next();
    });

    app.get("/modified-request", (req, res) => {
      res.send(req.customProperty);
    });

    await app.navigate("/modified-request");
    assert.equal(document.body.innerHTML, "Modified by middleware");
  });

  it("handles nested routers", async () => {
    const router1 = express.Router();
    const router2 = express.Router();

    router2.get("/nested", (req, res) => {
      res.send("Nested route");
    });

    router1.use("/subroute", router2);
    app.use("/api", router1);

    await app.navigate("/api/subroute/nested");
    assert.equal(document.body.innerHTML, "Nested route");
  });

  it("handles route-specific middleware", async () => {
    const specificMiddleware = (req, res, next) => {
      req.specificProperty = "Route-specific middleware";
      next();
    };

    app.get("/specific-middleware", specificMiddleware, (req, res) => {
      res.send(req.specificProperty);
    });

    await app.navigate("/specific-middleware");
    assert.equal(document.body.innerHTML, "Route-specific middleware");
  });

  it("handles multiple route-specific middleware", async () => {
    const middleware1 = (req, res, next) => {
      req.property1 = "Middleware 1";
      next();
    };

    const middleware2 = (req, res, next) => {
      req.property2 = "Middleware 2";
      next();
    };

    app.get(
      "/multi-specific-middleware",
      middleware1,
      middleware2,
      (req, res) => {
        res.send(`${req.property1} ${req.property2}`);
      }
    );

    await app.navigate("/multi-specific-middleware");
    assert.equal(document.body.innerHTML, "Middleware 1 Middleware 2");
  });
});
