declare module "*.md" {
  const post: import("./types").Post;
  export default post;
}
