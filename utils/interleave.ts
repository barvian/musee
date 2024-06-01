export default <T>(arr: T[], x: T) => arr.flatMap((i) => [i, x]).slice(0, -1)
