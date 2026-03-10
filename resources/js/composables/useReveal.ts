import { onMounted, nextTick } from 'vue'

export function useReveal() {

onMounted(async () => {

await nextTick()

const elements = document.querySelectorAll('[data-reveal]')

const observer = new IntersectionObserver((entries) => {

entries.forEach((entry) => {

if (entry.isIntersecting) {

entry.target.classList.add('is-visible')
observer.unobserve(entry.target)

}

})

},{
threshold:0.1
})

elements.forEach((el)=>observer.observe(el))

})

}