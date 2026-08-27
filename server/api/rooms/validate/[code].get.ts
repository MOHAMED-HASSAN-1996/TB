export default defineEventHandler((event) => {
  const code = getRouterParam(event, 'code')?.toUpperCase() || '';
  const exists = roomExists(code);
  
  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Room not found'
    });
  }
  
  return { valid: true, code };
});
