import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Login from "./Login";

//Wong Sheen Kerr (A0269647J)

// Mocking axios, react-hot-toast, auth context, and header component
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
	useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../components/Header", () => () => null);

Object.defineProperty(window, "localStorage", {
	value: {
		setItem: jest.fn(),
	},
	writable: true,
});

window.matchMedia =
	window.matchMedia ||
	function () {
		return {
			matches: false,
			addListener: function () {},
			removeListener: function () {},
		};
	};

describe("Login Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("renders login form", () => {
		// Arrange & Act
		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Assert
		expect(screen.getByText("LOGIN FORM")).toBeInTheDocument();
		expect(screen.getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Enter Your Password"),
		).toBeInTheDocument();
	});

	it("inputs should be initially empty", () => {
		// Arrange & Act
		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Assert
		expect(screen.getByPlaceholderText("Enter Your Email").value).toBe("");
		expect(screen.getByPlaceholderText("Enter Your Password").value).toBe("");
	});

	it("should allow typing email and password", () => {
		// Arrange
		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
			target: { value: "password123" },
		});

		// Assert
		expect(screen.getByPlaceholderText("Enter Your Email").value).toBe(
			"test@example.com",
		);
		expect(screen.getByPlaceholderText("Enter Your Password").value).toBe(
			"password123",
		);
	});

	it("should login the user successfully", async () => {
		// Arrange
		axios.post.mockResolvedValueOnce({
			data: {
				success: true,
				user: { id: 1, name: "John Doe", email: "test@example.com" },
				token: "mockToken",
			},
		});

		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByText("LOGIN"));

		// Assert
		await waitFor(() => expect(axios.post).toHaveBeenCalled());
		expect(toast.success).toHaveBeenCalledWith(undefined, {
			duration: 5000,
			icon: "🙏",
			style: {
				background: "green",
				color: "white",
			},
		});
	});

	it("should display error message on failed login", async () => {
		// Arrange
		axios.post.mockRejectedValueOnce({ message: "Invalid credentials" });

		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByText("LOGIN"));

		// Assert
		await waitFor(() => expect(axios.post).toHaveBeenCalled());
		expect(toast.error).toHaveBeenCalledWith("Something went wrong");
		expect(console.log).toHaveBeenCalled();
	});

	it("should display error message when login returns success: false", async () => {
		// Arrange
		axios.post.mockResolvedValueOnce({
			data: {
				success: false,
				message: "Invalid email or password",
			},
		});

		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</MemoryRouter>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText("Enter Your Email"), {
			target: { value: "test@example.com" },
		});
		fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
			target: { value: "password123" },
		});
		fireEvent.click(screen.getByText("LOGIN"));

		// Assert
		await waitFor(() => expect(axios.post).toHaveBeenCalled());
		expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
	});

	it("should navigate to forgot password page when Forgot Password button is clicked", () => {
		// Arrange
		render(
			<MemoryRouter initialEntries={["/login"]}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route
						path="/forgot-password"
						element={<div>Forgot Password Page</div>}
					/>
				</Routes>
			</MemoryRouter>,
		);

		// Act
		fireEvent.click(screen.getByText("Forgot Password"));

		// Assert
		expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
	});
});
