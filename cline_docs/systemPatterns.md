# System Patterns

## UI Implementation Patterns

### Mobile Page Modernization

- Uses Tailwind CSS utility classes instead of SCSS
- Implements shadcn/ui Card components with CardHeader and CardContent structure
- Uses motion-v for animations with fade-in and slide-up effects
- Follows responsive design patterns with mobile-first approach
- Maintains proper internationalization support

### Animation Patterns

- Initial state: opacity: 0, y: 20 (for cards) or opacity: 0 (for images)
- Final state: opacity: 1, y: 0 (for cards) or opacity: 1 (for images)
- Transition duration: 0.5-0.8 seconds
- Staggered delays for multiple elements (0s, 0.1s, 0.2s)
- Applied to container divs for consistent experience

### Responsive Design Patterns

- Grid layouts with responsive breakpoints
- Text alignment changes based on screen size
- Flex direction changes for button layouts
- Proper spacing adjustments for different screen sizes

### Component Integration Patterns

- Import and use shadcn/ui components directly
- Wrap content in appropriate Card components
- Use motion-v components for animations
- Maintain proper Vue binding syntax for motion attributes
