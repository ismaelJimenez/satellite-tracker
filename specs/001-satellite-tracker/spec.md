# Feature Specification: Real-Time Satellite Tracker

**Feature Branch**: `001-satellite-tracker`  
**Created**: 2026-02-22  
**Status**: Draft  
**Input**: User description: "Build a web application that displays real-time satellite positions on a 2D world map. The app tracks space stations (ISS, Tiangong), GPS/navigation satellites, and weather satellites using TLE data from Celestrak. Satellites appear as icons on the map with their orbital paths drawn as curved lines showing the ground track. The map auto-updates positions every few seconds to show movement. Clicking a satellite opens a details panel showing its name, altitude, velocity, inclination, and current coordinates. Users can toggle visibility of satellite categories (stations, navigation, weather) using filter controls. The main view is the full-screen map with a collapsible sidebar for filters and selected satellite details."

## Clarifications

### Session 2026-02-22

- Q: When should the application refresh TLE data from Celestrak? → A: TLE data is fetched by a backoffice process and stored in GitHub; clients retrieve from GitHub, not Celestrak directly
- Q: What should the user see while loading satellite data? → A: Map visible immediately with loading spinner overlay; spinner disappears when satellites appear
- Q: How many satellites should display before requiring performance optimization? → A: 100-200 satellites without clustering; clustering/LOD may apply beyond 200

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Satellites on Map (Priority: P1)

As a user, I want to see satellites displayed on a world map so I can understand where they are located in real-time. When I open the application, a full-screen 2D world map loads showing satellite icons at their current positions. The map displays satellites from three categories: space stations, GPS/navigation satellites, and weather satellites—each with a distinct icon style.

**Why this priority**: This is the core value proposition. Without satellites visible on a map, the application delivers no value. Everything else builds on this foundation.

**Independent Test**: Can be fully tested by opening the app and verifying satellite icons appear on the map at plausible geographic positions. Delivers immediate value as a "where are satellites right now" viewer.

**Acceptance Scenarios**:

1. **Given** the application loads successfully, **When** the map renders, **Then** satellite icons appear at positions corresponding to their real-time locations
2. **Given** the map is displayed, **When** I observe the satellites, **Then** different satellite categories are visually distinguishable by icon style
3. **Given** TLE data is available from Celestrak, **When** positions are calculated, **Then** satellites appear at geographically accurate positions (±50km tolerance)

---

### User Story 2 - Real-Time Position Updates (Priority: P2)

As a user, I want satellite positions to update automatically so I can watch them move across the map without refreshing. The satellites smoothly transition to new positions every few seconds, showing their orbital movement in real-time.

**Why this priority**: Real-time updates differentiate this from a static snapshot. Users can watch the ISS cross continents, making the app engaging and useful for tracking passes.

**Independent Test**: Can be tested by observing the ISS icon for 60 seconds and verifying it moves perceptibly across the map. Delivers value as a live tracking experience.

**Acceptance Scenarios**:

1. **Given** satellites are displayed on the map, **When** 5 seconds elapse, **Then** satellite positions update to reflect their new locations
2. **Given** position updates occur, **When** observing a fast-moving satellite (e.g., ISS), **Then** movement is visually perceptible within 30 seconds
3. **Given** the browser tab remains open, **When** 10 minutes pass, **Then** positions continue updating without manual refresh

---

### User Story 3 - View Satellite Details (Priority: P3)

As a user, I want to click on a satellite to see detailed information about it so I can learn more about specific satellites I'm interested in. A details panel opens showing the satellite's name, current altitude, velocity, orbital inclination, and geographic coordinates.

**Why this priority**: Details add depth and educational value. Users can identify satellites and understand their orbital characteristics. Important but not essential for MVP.

**Independent Test**: Can be tested by clicking any satellite icon and verifying the details panel displays with accurate information. Delivers value as an educational reference.

**Acceptance Scenarios**:

1. **Given** satellites are displayed on the map, **When** I click a satellite icon, **Then** a details panel opens in the sidebar
2. **Given** the details panel is open, **When** I view it, **Then** it displays: satellite name, altitude (km), velocity (km/s), inclination (degrees), latitude, and longitude
3. **Given** a details panel is open, **When** I click a different satellite, **Then** the panel updates to show the new satellite's information
4. **Given** a details panel is open, **When** I click a close button or click outside, **Then** the panel closes

---

### User Story 4 - Filter Satellites by Category (Priority: P4)

As a user, I want to toggle visibility of satellite categories so I can focus on the satellites I care about. The sidebar contains filter controls for each category: space stations, GPS/navigation, and weather satellites. Toggling a filter hides or shows all satellites in that category.

**Why this priority**: Filtering reduces visual clutter when tracking specific satellite types. Useful for focused use cases but the app works without it.

**Independent Test**: Can be tested by toggling the "Weather" filter off and verifying weather satellite icons disappear from the map. Delivers value as a customization feature.

**Acceptance Scenarios**:

1. **Given** all categories are visible, **When** I toggle off "GPS/Navigation", **Then** all GPS satellite icons disappear from the map
2. **Given** a category is hidden, **When** I toggle it back on, **Then** those satellites reappear at their current positions
3. **Given** filters are applied, **When** positions update, **Then** hidden categories remain hidden
4. **Given** a satellite from a hidden category was selected, **When** I hide its category, **Then** the details panel closes

---

### User Story 5 - View Orbital Path (Priority: P5)

As a user, I want to see a satellite's orbital path drawn on the map so I can understand where it has been and where it's going. When viewing satellite details, the ground track is drawn as a curved line showing the orbit trajectory.

**Why this priority**: Orbit visualization adds significant value for understanding satellite behavior but requires additional computation. Enhancement to the core tracking experience.

**Independent Test**: Can be tested by selecting the ISS and verifying a curved line appears showing its ground track across the map. Delivers value as a trajectory visualization.

**Acceptance Scenarios**:

1. **Given** I select a satellite, **When** the details panel opens, **Then** the orbital ground track appears on the map as a curved line
2. **Given** an orbital path is displayed, **When** I observe it, **Then** it shows at least one complete orbit (past and future positions)
3. **Given** an orbital path is displayed, **When** I select a different satellite, **Then** the previous path disappears and the new path appears
4. **Given** an orbital path is displayed, **When** I close the details panel, **Then** the path disappears

---

### Edge Cases

- What happens when Celestrak is unavailable? Display cached data with a stale-data indicator; show error message if no cache exists
- What happens when a satellite's TLE data is outdated (>7 days)? Mark satellite with warning indicator; exclude from display if >30 days old
- What happens when the user zooms in/out? Satellite icons maintain consistent size; clustering may apply at very low zoom levels
- How does the app handle 200+ satellites on screen? Performance remains smooth; clustering or level-of-detail applies beyond 200 satellites

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a 2D world map as the primary interface on page load
- **FR-002**: System MUST fetch Two-Line Element (TLE) data from a GitHub-hosted static file (populated by backoffice process) for satellite position calculation
- **FR-003**: System MUST calculate satellite positions from TLE data using SGP4/SDP4 propagation
- **FR-004**: System MUST display satellite icons at calculated geographic positions on the map
- **FR-005**: System MUST support three satellite categories: space stations, GPS/navigation, and weather satellites
- **FR-006**: System MUST visually differentiate satellite categories using distinct icon styles
- **FR-007**: System MUST update satellite positions automatically at intervals of 5 seconds or less
- **FR-008**: System MUST provide a collapsible sidebar for filters and satellite details
- **FR-009**: System MUST display a details panel when a satellite is clicked, showing: name, altitude, velocity, inclination, latitude, longitude
- **FR-010**: System MUST allow users to toggle visibility of each satellite category independently
- **FR-011**: System MUST draw orbital ground track as a curved line when a satellite is selected
- **FR-012**: System MUST handle GitHub TLE file unavailability gracefully with cached data or error messaging
- **FR-013**: System MUST work in modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- **FR-014**: System MUST display the map immediately on load with a loading spinner overlay while fetching TLE data; spinner MUST disappear when satellites appear

### Key Entities

- **Satellite**: Represents a tracked object; attributes include NORAD ID, name, category, TLE data, and computed position (latitude, longitude, altitude)
- **Category**: Classification of satellites (space station, navigation, weather); used for filtering and icon styling
- **Orbital Elements**: TLE-derived parameters including inclination, eccentricity, mean motion; used for position calculation and display
- **Ground Track**: Computed path of a satellite projected onto Earth's surface; represented as a series of geographic coordinates

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view satellite positions on the map within 3 seconds of page load
- **SC-002**: Satellite position updates are visually perceptible when watching a low-earth orbit satellite for 60 seconds
- **SC-003**: Users can access detailed information about any satellite within 2 clicks from the main view
- **SC-004**: Users can filter to show only satellites of interest within 3 seconds
- **SC-005**: The application displays up to 200 satellites simultaneously without visible performance degradation
- **SC-006**: Position calculations are accurate to within 50km of actual satellite location
- **SC-007**: The application remains functional for a 30-minute session without requiring refresh

## Assumptions

- A backoffice process updates TLE data in GitHub; clients fetch from GitHub (not Celestrak directly)
- GitHub-hosted TLE file is publicly accessible without authentication
- Users have modern browsers with JavaScript enabled
- Position calculation using SGP4/SDP4 is sufficient accuracy for visualization purposes
- No user accounts or persistent preferences are required for MVP
- The application is read-only (no user-generated content or data submission)
- Map tiles are available from a free/open mapping provider
