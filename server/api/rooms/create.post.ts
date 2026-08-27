export default defineEventHandler((event) => {
  const code = createRoom();
  return { code };
});
