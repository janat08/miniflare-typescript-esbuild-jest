
export class Counter implements DurableObject {
  // Store this.state for later access
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request) {
    // Get the current count, defaulting to 0
    return new Response()
  }
}
