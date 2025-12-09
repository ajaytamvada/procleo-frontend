/**
 * Converts a route path with parameters (e.g., /users/:id) into a regular expression.
 * @param routePath The route path with parameters.
 * @returns A regular expression that can be used to match the route path.
 */
export const createPathRegex = (routePath: string): RegExp => {
  const regexString = routePath.replace(/:\w+/g, '([^/]+)');
  return new RegExp(`^${regexString}$`);
};
