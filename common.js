export function disableTextareas() {
    const textareas = document.querySelectorAll("textarea");
    textareas.forEach((textarea) => (textarea.disabled = true));
  }