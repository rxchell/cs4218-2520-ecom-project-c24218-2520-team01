import { afterEach, beforeEach, describe, jest } from "@jest/globals";
import categoryModel from "../models/categoryModel.js";
import {
    createCategoryController
} from "./categoryController.js";
import slugify from "slugify";

// Written by Nicholas Cheng, A0269648H

// Mock categoryModel
jest.mock("../models/categoryModel.js");

// Mock slugify
jest.mock("slugify");

describe("Category CRUD operations", () => {
    describe("Unit test for createCategoryController", () => {
        // Set up variables for our test cases

        let req, res, consoleSpy;

        // Before each test case we reset our variables / mocks
        beforeEach(() => {
            req = {
                body: {},
            };
            res = {
                status: jest.fn().mockReturnThis(),
                send: jest.fn(),
            };
            // Spy instead of mock because we might want to log in between tests.
            consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
            jest.clearAllMocks();
        });

        afterEach(() => {
            consoleSpy.mockRestore();
        });

        describe("Successful creation of a category", () => {
            test("Return 201 when a unique category name is provided", async () => {
                // Arrange
                req.body.name = "Electronic";
                // Mimic a sample return object from mongoose
                const mockCategoryObject = {
                    _id: 1,
                    name: "Electronic",
                    slug: "electronic"
                };

                // Mock our dependencies & what they will return
                categoryModel.findOne.mockResolvedValue(null);
                slugify.mockReturnValue("electronic");

                categoryModel.mockImplementation(() => ({
                    save: jest.fn().mockResolvedValue(mockCategoryObject)
                }));

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Electronic" });
                expect(categoryModel).toHaveBeenCalledWith({
                    name: "Electronic",
                    slug: "electronic"
                });
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "New category created",
                    category: mockCategoryObject,
                });
            });
        })

        describe("Validation errors when creating a category", () => {
            test("Return 422 when category name is an empty string", async () => {
                /**
                 * Assumption: Status code 422 is used for validation errors.
                 * In addition taking a quick look at the codebase, slug value is used as part of a URL
                 * So we should not allow empty string category names
                 */

                // Arrange
                req.body.name = "";

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(422);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "Category name cannot be empty",
                });
            });

            test("Return 422 when category name is just white spaces", async () => {
                /**
                 * Assumption: An input with whitespaces is just the same as just having an empty string
                 */

                // Arrange
                req.body.name = "    ";

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(422);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "Category name cannot be empty",
                });
            });

            test("Return 422 when category name is null", async () => {
                // Arrange
                req.body.name = null;

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(res.status).toHaveBeenCalledWith(422);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "Category name cannot be empty",
                });
            });

            test("Return 409 when category name already exists", async () => {
                /**
                 * Assumption: Status code 409 is for request that cannot
                 * be completed because it conflicts with the current state of the
                 * target resource on the server.
                 * 
                 * I also asusme that succes should be false because letting the user know
                 * that the category already exists. By returning true we are letting the user
                 * know that the duplicated catgory is created.
                 */

                // Arrange
                req.body.name = "Electronic"; // Assume this is already in the database
                // Mock this object to be returned when doing findOne()
                const mockCategoryObject = {
                    _id: 1,
                    name: "Electronic",
                    slug: "electronic"
                };

                categoryModel.findOne.mockResolvedValue(mockCategoryObject);

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(categoryModel.findOne).toHaveBeenCalledWith({ name: "Electronic" });
                expect(res.status).toHaveBeenCalledWith(409);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "Category already exists",
                });
            });
        })

        describe("Errors reguarding the database", () => {
            test("Return 500 when an error occurs", async () => {
                // Arrange
                req.body = { name: "Electronic" };
                const mockError = new Error("Database error");

                categoryModel.findOne.mockImplementation(() => {
                    throw mockError;
                });

                // Act
                await createCategoryController(req, res);

                // Assert
                expect(consoleSpy).toHaveBeenCalledWith(mockError);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error: mockError,
                    message: "Error in creating category",
                });
            });
        })
    })
})