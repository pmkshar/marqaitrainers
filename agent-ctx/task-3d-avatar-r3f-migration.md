# Task: Replace SVG Avatar with React Three Fiber 3D Avatar

## Summary
Replaced the existing SVG-based `Animated3DTutorAvatar` component with a true 3D human avatar using React Three Fiber, while maintaining the same export interface for backward compatibility.

## Files Created/Modified

### Created: `/home/z/my-project/src/components/tutor-avatar-3d.tsx`
- True 3D human head/bust component using `@react-three/fiber` and `three`
- Constructs a stylized Indian female teacher ("Maya") using primitive shapes:
  - Head: elongated sphere with chin and cheek highlights
  - Hair: cap, bun, bangs, side hair, wisps, and part line
  - Eyes: eyeballs + iris + pupil + specular highlights + upper eyelid arcs
  - Eyebrows: animated boxes
  - Nose: tip + bridge + nostrils
  - Mouth: upper lip + lower lip + animated mouth opening
  - Cultural details: bindhi, gold earrings with dangles, necklace with pendant
  - Body: neck + shoulders with clothing + neckline trim
- Animation system:
  - `useFrame()` loop with frame-based blink logic (no setTimeout)
  - Expression interpolation (lerp) with 5 states: neutral, explaining, thinking, happy, curious
  - Speaking mouth animation using layered sine waves for natural movement
  - Idle animations: subtle head sway and breathing
- Shared materials via `useMemo` for performance
- Material cleanup on unmount via `useEffect`
- Transparent background Canvas with warm 3-point lighting
- Default export for dynamic import compatibility

### Modified: `/home/z/my-project/src/components/animated-tutor-avatar.tsx`
- Complete rewrite as a wrapper component
- Uses `next/dynamic` with `ssr: false` to load the 3D component client-only
- Includes `FallbackAvatar` SVG component shown during loading
- Includes `AvatarErrorBoundary` class component for WebGL failure recovery
- Uses `React.Suspense` with SVG fallback for smooth loading transition
- Maintains exact same export interface: `Animated3DTutorAvatarProps` and `Animated3DTutorAvatar`

## Architecture Decisions
1. **Two-file approach**: Separated the 3D component from the wrapper to enable `ssr: false` dynamic import
2. **Primitive shapes only**: No GLTF models - all geometry built from spheres, cylinders, boxes, and toruses
3. **Frame-based blink**: Avoided `setTimeout` for blinks; uses elapsed time comparison in `useFrame`
4. **Shared materials**: All MeshStandardMaterial instances created once via `useMemo` and shared across meshes
5. **Error boundary**: Class component wraps the 3D canvas to catch WebGL runtime errors
6. **SVG fallback**: Matches the 3D avatar's visual style (same colors, bindhi, earrings, etc.)

## No Breaking Changes
All consuming components continue to work unchanged:
- `floating-tutor-popup.tsx` - uses `Animated3DTutorAvatar` with sizes 36
- `global-tutor-popup.tsx` - uses sizes 26 and 36
- `lesson-view.tsx` - uses sizes 40 and 120
- `tutor-chat.tsx` - uses sizes 100
