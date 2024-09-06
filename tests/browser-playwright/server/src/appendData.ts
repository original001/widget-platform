export function appendData(document: Document, container: HTMLElement, data: string): Node[] {
    const textNode = document.createTextNode(data);
    const brNode = document.createElement("br");
    container.appendChild(textNode);
    container.appendChild(brNode);
    return [textNode, brNode];
}
