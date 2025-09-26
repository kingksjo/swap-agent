# Frontend Conversion Plan: SwapAI to Miye

This document outlines the plan to convert the current frontend design of SwapAI to the new Miye design, as specified in the provided Figma screenshots.

## 1. Design Analysis

The new design presents a cleaner, more focused user experience. The key changes are:

*   **Branding:** The product is rebranded from "SwapAI" to "Miye". This involves a new logo and a slightly different color palette.
*   **Landing Page:** A new landing page is introduced to guide the user.
*   **Conversational UI:** The chat interface is updated to be more readable and visually appealing.

### Color Scheme

*   **Primary Background:** Dark Gray (e.g., `#0D0D0D`)
*   **Secondary Background:** Medium Gray (e.g., `#1A1A1A`)
*   **Accent:** Bright Orange (e.g., `#F97316`)
*   **Text:** White/Light Gray

### Typography

*   **Font:** A clean, modern sans-serif font (e.g., Inter, Manrope).
*   **Headings:** Bold and large for emphasis.
*   **Body:** Regular weight and smaller size for readability.

## 2. Asset Requirements

The following assets are required for the new design.

*   **Miye Logo:** An SVG of the new "miye" logo.
*   **Icons:**
    *   Send Icon (for the conversational input)
    *   Wallet Icon
    *   Settings Icon
    *   Search Icon
    *   Chevron Down Icon
    *   Copy, External Link, Log Out Icons (for wallet menu)

Most of these can be sourced from the `lucide-react` library, which is already a dependency.

## 3. Component-by-Component Conversion Plan

### `App.tsx`

*   **State Management:** Introduce a state to handle the initial landing page view vs. the conversation view.
*   **Layout:**
    *   When no messages are present, render a new `LandingPage` component.
    *   When messages exist, render the `ConversationHistory` and the input, similar to the current implementation.

### `Header.tsx`

*   **Logo:** Replace the "SwapAI" logo and text with the new Miye logo.
*   **Navigation:** Remove the "Explore" and "Pool" navigation links. The "Trade" link should also be removed as the main interface is now the conversational input.
*   **Search Bar:** Remove the global search bar.
*   **Styling:** Update the styling to match the new simpler header.

### `ConversationalInput.tsx`

*   **Styling:**
    *   Change the input to a rounded rectangle with a subtle border.
    *   Update the placeholder text to "Ask me anything".
    *   The send button should be an icon, only appearing when there is text.
*   **Functionality:** No major functional changes are needed.

### `UnifiedMessage.tsx`

*   **Styling:**
    *   Update the message bubble styles for both user and assistant to match the new design (more rounded, different background colors).
    *   Adjust the typography for better readability.
    *   Ensure proper rendering of markdown elements like headings, lists, and code snippets.

### New Components

*   **`LandingPage.tsx`:**
    *   This component will be displayed when the user first visits the site.
    *   It will contain:
        *   The "Introducing Miye" lozenge.
        *   The main heading: "What can I help with?".
        *   The `ConversationalInput` component.
        *   Three suggestion buttons: "Swap Tokens", "Market Trends", "Learn".
*   **`SuggestionButton.tsx`:**
    *   A simple button component for the suggestions on the landing page. It will have an outlined style.

## 4. Styling and Theming (Tailwind CSS)

*   **`tailwind.config.js`:**
    *   Update the `theme.extend.colors` object to include the new Miye color palette.
    *   Potentially add the new sans-serif font to the `theme.extend.fontFamily` object.
*   **`index.css`:**
    *   Ensure the base styles and background color are set correctly.

## 5. Step-by-Step Implementation Guide

1.  **Setup:**
    *   Obtain the Miye logo SVG and add it to the `public` directory.
    *   Update `tailwind.config.js` with the new color palette.
2.  **Header:**
    *   Modify `Header.tsx` to implement the new simpler design.
3.  **Landing Page:**
    *   Create the `LandingPage.tsx` and `SuggestionButton.tsx` components.
    *   Update `App.tsx` to show the `LandingPage` component initially.
4.  **Conversational UI:**
    *   Update the styling of `ConversationalInput.tsx` and `UnifiedMessage.tsx`.
5.  **Cleanup:**
    *   Remove any unused components or styles from the old design.
    *   Ensure the application is fully responsive.

## 6. Backend/Agent Dependencies

The frontend conversion is largely independent of the backend agent. The existing `agentClient.ts` and the `sendToAgent` and `confirmAction` functions should continue to work as expected. The primary change is how the UI is presented to the user.


Miye logo svg

```
<svg width="65" height="87" viewBox="0 0 65 87" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M46.3426 39.0704L51.9854 35.7583L41.8038 19.9952L37.265 22.694L46.2813 39.0704H46.3426ZM53.3348 19.1365L53.2735 12.635L34.4436 13.4324V18.7072L53.2735 19.1365H53.3348ZM18.6192 7.1762L13.0377 10.4883L23.0967 26.3127L27.5741 23.6753L18.6192 7.1762ZM39.4118 3.25076L33.769 0L25.0594 16.5605L29.5368 19.1979L39.3504 3.25076H39.4118Z" fill="white" fill-opacity="0.7"/>
<path d="M51.9508 35.75L46.3375 39.0459H46.2955L37.2975 22.7021L41.7955 20.0273L51.9508 35.75ZM27.5406 23.666L23.1041 26.2803L13.0709 10.4961L18.61 7.20898L27.5406 23.666ZM39.3326 3.23242L39.3297 3.23828L29.5289 19.1641L25.0905 16.5508L33.778 0.0341797L39.3326 3.23242ZM53.3102 19.1123H53.274L34.4674 18.6826V13.4561L53.2496 12.6602L53.3102 19.1123Z" stroke="white" stroke-opacity="0.7" stroke-width="0.0484945"/>
<path d="M31.1928 46.3697L25.4887 43.1803L35.3636 27.2332L39.9637 29.8093L31.1928 46.3697Z" fill="#FF8B00" fill-opacity="0.7"/>
<path d="M30.5795 32.9374L11.7496 33.7347V27.1719L30.4568 27.7239L30.5795 32.9374Z" fill="#FF8B00" fill-opacity="0.7"/>
<path d="M1.99466 80.3691V69.3854C1.99466 68.7865 1.97534 68.1779 1.9367 67.5596C1.89806 66.9414 1.8401 66.3328 1.76282 65.7338H5.26949L5.5593 68.6319H5.21153C5.61726 67.6273 6.23552 66.8448 7.0663 66.2845C7.9164 65.7242 8.92107 65.444 10.0803 65.444C11.2395 65.444 12.1959 65.7242 12.9494 66.2845C13.7222 66.8255 14.2632 67.6756 14.5723 68.8348H14.1086C14.5144 67.7915 15.1809 66.9704 16.1083 66.3714C17.0357 65.7532 18.0983 65.444 19.2962 65.444C20.9384 65.444 22.1653 65.927 22.9768 66.8931C23.7882 67.8591 24.1939 69.3661 24.1939 71.4141V80.3691H20.5713V71.559C20.5713 70.3997 20.3781 69.569 19.9917 69.0666C19.6053 68.545 18.9871 68.2842 18.137 68.2842C17.1323 68.2842 16.3402 68.6416 15.7605 69.3564C15.1809 70.052 14.8911 70.9987 14.8911 72.1966V80.3691H11.2685V71.559C11.2685 70.3997 11.0753 69.569 10.6889 69.0666C10.3025 68.545 9.68423 68.2842 8.83413 68.2842C7.82946 68.2842 7.03732 68.6416 6.4577 69.3564C5.89741 70.052 5.61726 70.9987 5.61726 72.1966V80.3691H1.99466ZM28.0604 80.3691V65.7338H31.683V80.3691H28.0604ZM27.8575 62.9807V59.445H31.8859V62.9807H27.8575ZM35.3271 86.9478L34.4867 84.0787C35.3947 83.8855 36.1579 83.6633 36.7761 83.4121C37.3944 83.161 37.9064 82.8325 38.3121 82.4268C38.7178 82.021 39.056 81.4994 39.3264 80.8618L40.051 79.1519L39.964 80.572L33.5882 65.7338H37.4427L42.0217 77.1523H41.1812L45.7892 65.7338H49.4407L42.7752 81.1806C42.3308 82.2239 41.8478 83.0837 41.3261 83.7599C40.8045 84.4554 40.2442 85.0061 39.6452 85.4118C39.0463 85.8368 38.3894 86.1653 37.6745 86.3971C36.9597 86.629 36.1772 86.8125 35.3271 86.9478ZM58.1409 80.6589C55.6872 80.6589 53.7648 79.9827 52.3737 78.6303C50.9826 77.2779 50.2871 75.4231 50.2871 73.066C50.2871 71.5397 50.5865 70.2065 51.1855 69.0666C51.7844 67.9267 52.6152 67.038 53.6778 66.4004C54.7598 65.7628 56.0156 65.444 57.4453 65.444C58.8557 65.444 60.0343 65.7435 60.981 66.3424C61.9277 66.9414 62.6425 67.7818 63.1256 68.8638C63.6279 69.9457 63.8791 71.2112 63.8791 72.6603V73.6166H53.2141V71.7039H61.2998L60.8071 72.1096C60.8071 70.7572 60.5173 69.7235 59.9377 69.0087C59.3774 68.2938 58.5563 67.9364 57.4743 67.9364C56.2764 67.9364 55.349 68.3614 54.6922 69.2115C54.0546 70.0616 53.7358 71.2499 53.7358 72.7762V73.1529C53.7358 74.7372 54.1222 75.9254 54.895 76.7176C55.6872 77.4904 56.7981 77.8768 58.2278 77.8768C59.0586 77.8768 59.8314 77.7705 60.5463 77.558C61.2805 77.3262 61.976 76.9591 62.6329 76.4567L63.7052 78.8911C63.0096 79.4514 62.1789 79.8861 61.2128 80.1953C60.2468 80.5044 59.2228 80.6589 58.1409 80.6589Z" fill="white" fill-opacity="0.7"/>
</svg>
```