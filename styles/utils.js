
export const centered = diameter => ({
  width: diameter,
  height: diameter,
  alignItems: 'center',
  justifyContent: 'center',
})

export const circled = diameter => ({
  ...centered(diameter),
  borderRadius: diameter / 2,
})
