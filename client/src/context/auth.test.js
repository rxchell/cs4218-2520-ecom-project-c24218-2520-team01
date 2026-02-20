import React from "react";
import {
	render,
	screen,
	waitFor,
	renderHook,
	act,
} from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";
import "@testing-library/jest-dom/extend-expect";

//Wong Sheen Kerr (A0269647J)

// Mock axios
jest.mock("axios");

// Mock localStorage - auth.js only uses getItem
let localStorageMock = {};
beforeEach(() => {
	localStorageMock = {
		getItem: jest.fn((key) => {
			return localStorageMock[key] || null;
		}),
	};
	Object.defineProperty(global, "localStorage", {
		value: localStorageMock,
		writable: true,
	});
});

// Lambda Function for wrapping AuthProvider for testing
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe("AuthProvider", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		localStorageMock.getItem.mockReturnValue(null);
		// Reset axios headers
		axios.defaults.headers.common = {};
	});

	it("should render children when AuthProvider wraps them", () => {
		// Arrange
		const childText = "Test Child Content";

		// Act
		render(<div>{childText}</div>, { wrapper });

		// Assert
		expect(screen.getByText(childText)).toBeInTheDocument();
	});

	it("should provide initial auth state with null user and empty token when localStorage returns null", () => {
		// Arrange
		localStorageMock.getItem.mockReturnValue(null);

		// Act
		const { result } = renderHook(() => useAuth(), { wrapper });

		// Assert
		expect(result.current[0].user).toBeNull();
		expect(result.current[0].token).toBe("");
	});

	it("should provide initial auth state with null user and empty token when localStorage throws error", () => {
		// Arrange
		localStorageMock.getItem.mockImplementation(() => {
			throw new Error("localStorage error");
		});
		const consoleErrorSpy = jest
			.spyOn(console, "error")
			.mockImplementation(() => {});

		// Act
		const { result } = renderHook(() => useAuth(), { wrapper });

		// Assert
		expect(result.current[0].user).toBeNull();
		expect(result.current[0].token).toBe("");
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			"Error loading auth from localStorage:",
			expect.any(Error),
		);

		// Cleanup
		consoleErrorSpy.mockRestore();
	});

	it("should set axios authorization header when token exists in initial state", () => {
		// Arrange - token is empty string in initial state

		// Act
		renderHook(() => useAuth(), { wrapper });

		// Assert - initial token is empty string
		expect(axios.defaults.headers.common["Authorization"]).toBe("");
	});

	it("should load auth from localStorage when data exists", async () => {
		// Arrange - mock localStorage to return valid auth data
		const mockAuthData = JSON.stringify({
			user: { name: "Sheen" },
			token: "tooken123",
		});
		localStorageMock.getItem = jest.fn(() => mockAuthData);

		// Act
		const { result } = renderHook(() => useAuth(), { wrapper });

		// Verify localStorage was called
		expect(localStorageMock.getItem).toHaveBeenCalledWith("auth");

		// Verify auth state is loaded correctly
		await waitFor(() => {
			expect(result.current[0].user).toEqual({ name: "Sheen" });
		});
		expect(result.current[0].token).toBe("tooken123");
	});

	it("should update auth state when setAuth is called with new user data", async () => {
		// Arrange
		localStorageMock.getItem.mockReturnValue(null);

		// Act - current[0] = auth, current[1] = setAuth() hook
		const { result } = renderHook(() => useAuth(), { wrapper });

		// Initial state - auth is null
		expect(result.current[0].user).toBeNull();

		// Act - call setAuth() hook
		act(() => {
			result.current[1]({ user: { name: "Sheen" }, token: "tooken123" });
		});

		// Assert - wait for state update
		await waitFor(() => {
			expect(result.current[0].user).toEqual({ name: "Sheen" });
		});
		expect(result.current[0].token).toBe("tooken123");
	});

	it("should update axios authorization header when setAuth is called", async () => {
		// Arrange
		localStorageMock.getItem.mockReturnValue(null);

		// Act - current[0] = auth, current[1] = setAuth() hook
		const { result } = renderHook(() => useAuth(), { wrapper });

		// Act - call setAuth() hook
		act(() => {
			result.current[1]({ user: { name: "Sheen" }, token: "tooken123" });
		});

		// Assert
		await waitFor(() => {
			expect(axios.defaults.headers.common["Authorization"]).toBe("tooken123");
		});
	});
});
