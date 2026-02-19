import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Categories from "./Categories.js";
import useCategory from "../hooks/useCategory";
import Layout from "../components/Layout";

// Mock the layout and useCategory hook
jest.mock("../components/Layout", () => {
    return ({ children }) => (
        <div data-testid="mock layout">
            {children}
        </div>
    );
});
jest.mock("../hooks/useCategory");

const renderComponent = () =>
    render(
        <MemoryRouter>
            <Categories />
        </MemoryRouter>
    );


describe("Unit test for categories UI component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("Render successfully with no categories", () => {
        // Arrange
        useCategory.mockReturnValue([]);

        // Act
        renderComponent();

        // Assert
        expect(screen.getByTestId("mock layout")).toBeInTheDocument(); // Ensures we have rendered the page
        const links = screen.queryAllByRole("link"); // Verify no category links are rendered
        expect(links).toHaveLength(0);
    });

    test("Renders categories after being fetched by useCategory hook", () => {
        // Arrange
        const mockCategories = [
            { _id: 1, name: "Electronics", slug: "electronics" },
            { _id: 2, name: "Books", slug: "books" },
        ];
        useCategory.mockReturnValueOnce(mockCategories);

        // Act
        renderComponent();

        // Assert
        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Books")).toBeInTheDocument();
    });

    test("Renders correct links on categories page", () => {
        // Arrange
        const mockCategories = [
            { _id: 1, name: "Electronics", slug: "electronics" },
            { _id: 2, name: "Books", slug: "books" },
        ];
        useCategory.mockReturnValueOnce(mockCategories);

        // Act
        renderComponent();

        // Assert
        const links = screen.getAllByRole("link");
        expect(links).toHaveLength(mockCategories.length);

        mockCategories.forEach((category, index) => {
            expect(links[index]).toHaveTextContent(category.name);
            expect(links[index]).toHaveAttribute("href", `/category/${category.slug}`);
        });
    });
})