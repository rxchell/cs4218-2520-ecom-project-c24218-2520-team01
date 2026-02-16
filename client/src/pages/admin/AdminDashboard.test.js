import React from "react";
import { render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom";

// Lim Jia Wei, A0277381W

// Mock useAuth hook
jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(),
}));

// Mock AdminMenu component
jest.mock("../../components/AdminMenu", () => () => (
    <div data-testid="admin-menu">AdminMenu</div>
));

// Mock Layout component
jest.mock("./../../components/Layout", () => ({ children }) => (
    <div data-testid="layout">{children}</div>
));

describe("Tests for AdminDashboard Component", () => {

    // Arrange
    const mockAuth = {
        user: {
            name: "Admin",
            email: "admin@test.com",
            phone: "123456789",
        },
    };

    beforeEach(() => {
        useAuth.mockReturnValue([mockAuth, jest.fn()]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Render admin details correctly", () => {

        // Act
        render(<AdminDashboard />);

        // Assert if user details are displayed
        expect(screen.getByText(/Admin Name : Admin/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin Email : admin@test.com/i)).toBeInTheDocument();
        expect(screen.getByText(/Admin Contact : 123456789/i)).toBeInTheDocument();

        // Assert if mocked components are rendered
        expect(screen.getByTestId("admin-menu")).toBeInTheDocument();
        expect(screen.getByTestId("layout")).toBeInTheDocument();
    });
});
