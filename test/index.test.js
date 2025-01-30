const express = require("../src/index");

describe("browser-express", () => {
  let app;

  beforeEach(async () => {
    if (app) {
      window.history.pushState({}, '', "/");
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
      expect(middlewareCount).toBe(2);
      res.send("Middleware test passed");
    });

    await app.navigate("/test-middleware");
  });

  it("handles GET requests with route parameters", async () => {
    app.get("/user/:id/profile/:section", (req, res) => {
      expect(req.params.id).toBe("123");
      expect(req.params.section).toBe("about");
      res.send("Route parameters test passed");
    });

    await app.navigate("/user/123/profile/about");
  });

  it("handles GET requests with query parameters", async () => {
    app.get("/search", (req, res) => {
      expect(req.query.q).toBe("test query");
      expect(req.query.page).toBe("2");
      res.send("Query parameters test passed");
    });

    await app.navigate("/search?q=test%20query&page=2");
  });

  it("handles POST requests with JSON body", async () => {
    app.post("/api/data", (req, res) => {
      expect(req.body).toEqual({ name: "John Doe", age: 30 });
      res.send("POST with JSON body test passed");
    });

    await app.submit("/api/data", "post", { name: "John Doe", age: 30 });
  });

  it("handles PUT requests", async () => {
    app.put("/api/update/:id", (req, res) => {
      expect(req.params.id).toBe("456");
      expect(req.body).toEqual({ status: "updated" });
      res.send("PUT request test passed");
    });

    await app.submit("/api/update/456", "put", { status: "updated" });
  });

  it("handles DELETE requests", async () => {
    app.delete("/api/remove/:id", (req, res) => {
      expect(req.params.id).toBe("789");
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
    expect(window.location.pathname).toBe("/target");
  });

  it("handles 404 Not Found", async () => {
    app.use((req, res) => {
      res.status(404).send("404 Not Found");
    });

    await app.navigate("/non-existent-route");
    expect(document.body.innerHTML).toBe("404 Not Found");
  });

  it("handles error middleware", async () => {
    const testError = new Error("Test error");
    
    app.get("/error", (req, res, next) => {
      next(testError);
    });

    app.use((err, req, res, next) => {
      res.status(500).send(`Error: ${err.message}`);
    });

    await app.navigate("/error");
    expect(document.body.innerHTML).toBe("Error: Test error");
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
    expect(document.body.innerHTML).toBe("GET resource");

    await app.submit("/api/resource", "post");
    expect(document.body.innerHTML).toBe("POST resource");

    await app.submit("/api/resource", "put");
    expect(document.body.innerHTML).toBe("PUT resource");
  });

  it("respects route order", async () => {
    app.get("/order/specific", (req, res) => {
      res.send("Specific route");
    });

    app.get("/order/:param", (req, res) => {
      res.send("Param route");
    });

    await app.navigate("/order/specific");
    expect(document.body.innerHTML).toBe("Specific route");

    await app.navigate("/order/other");
    expect(document.body.innerHTML).toBe("Param route");
  });

  it("handles multiple route parameters", async () => {
    app.get("/multi/:param1/:param2/:param3", (req, res) => {
      res.send(
        `${req.params.param1}-${req.params.param2}-${req.params.param3}`
      );
    });

    await app.navigate("/multi/one/two/three");
    expect(document.body.innerHTML).toBe("one-two-three");
  });

  it("handles query parameters with multiple values", async () => {
    app.get("/multi-query", (req, res) => {
      res.send(`${req.query.key.join(",")}`);
    });

    await app.navigate("/multi-query?key=value1&key=value2&key=value3");
    expect(document.body.innerHTML).toBe("value1,value2,value3");
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
    expect(document.body.innerHTML).toBe("Modified by middleware");
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
    expect(document.body.innerHTML).toBe("Nested route");
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
    expect(document.body.innerHTML).toBe("Route-specific middleware");
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
    expect(document.body.innerHTML).toBe("Middleware 1 Middleware 2");
  });

  it("handles URL encoded form submissions", async () => {
    app.post("/form-submit", (req, res) => {
      expect(req.body.user).toBe("test user");
      expect(req.body.email).toBe("test@example.com");
      res.send("Form submission successful");
    });

    await app.submit("/form-submit", "post", {
      user: "test user",
      email: "test@example.com",
    });
    expect(document.body.innerHTML).toBe("Form submission successful");
  });

  it("preserves query parameters during redirects", async () => {
    app.get("/redirect-with-query", (req, res) => {
      expect(req.query.param).toBe("test");
      res.redirect("/target-with-query?param=test");
    });

    app.get("/target-with-query", (req, res) => {
      expect(req.query.param).toBe("test");
      res.send("Query preserved");
    });

    await app.navigate("/redirect-with-query?param=test");
    expect(document.body.innerHTML).toBe("Query preserved");
  });

  it("processes request headers correctly", async () => {
    app.get("/headers", (req, res) => {
      expect(req.get("referrer")).toBe(document.referrer);
      expect(req.get("content-type")).toBe(document.contentType);
      res.send("Headers processed");
    });

    await app.navigate("/headers");
  });

  it("handles status codes properly", async () => {
    app.get("/status", (req, res) => {
      res.status(201).send("Created");
    });

    await app.navigate("/status");
    expect(document.body.innerHTML).toBe("Created");
  });

  it("maintains local variables correctly", async () => {
    app.use((req, res, next) => {
      res.locals.testVar = "test value";
      next();
    });

    app.get("/locals", (req, res) => {
      expect(res.locals.testVar).toBe("test value");
      res.send("Locals maintained");
    });

    await app.navigate("/locals");
  });

  it("handles multiple redirects in sequence", async () => {
    app.get("/redirect1", (req, res) => {
      res.redirect("/redirect2");
    });

    app.get("/redirect2", (req, res) => {
      res.redirect("/redirect3");
    });

    app.get("/redirect3", (req, res) => {
      res.send("Final destination");
    });

    await app.navigate("/redirect1");
    expect(document.body.innerHTML).toBe("Final destination");
    expect(window.location.pathname).toBe("/redirect3");
  });

  it("handles request subdomains correctly", async () => {
    app.get("/subdomains", (req, res) => {
      expect(Array.isArray(req.subdomains)).toBe(true);
      res.send("Subdomains processed");
    });

    await app.navigate("/subdomains");
  });
});
