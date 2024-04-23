import request from "supertest";
import app from "../../app"; // Assuming your Express app is exported as 'app'

describe("GET /User", () => {
  it("should return a list of users", async () => {
    const response = await request(app).get("/User");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        // Add your expected user objects here
      ])
    );
  });

  it("should handle errors", async () => {
    const response = await request(app).get("/User");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error");
  });
});
