export { default as AvailableCoursesTags } from '../../components/AvailableCoursesTags.vue'
export { default as ChangeAssessmentSchoolClass } from '../../components/ChangeAssessmentSchoolClass.vue'
export { default as ChipButton } from '../../components/ChipButton.vue'
export { default as DataTable } from '../../components/DataTable.vue'
export { default as DataTableHeader } from '../../components/DataTableHeader.vue'
export { default as DateTimeInBulkForm } from '../../components/DateTimeInBulkForm.vue'
export { default as EmptyState } from '../../components/EmptyState.vue'
export { default as FilterTab } from '../../components/FilterTab.vue'
export { default as FormCoursesPicker } from '../../components/FormCoursesPicker.vue'
export { default as FormDatePicker } from '../../components/FormDatePicker.vue'
export { default as FormDateTimePicker } from '../../components/FormDateTimePicker.vue'
export { default as FormSchoolClassPicker } from '../../components/FormSchoolClassPicker.vue'
export { default as FormSchoolPicker } from '../../components/FormSchoolPicker.vue'
export { default as FormTopicSelector } from '../../components/FormTopicSelector.vue'
export { default as JGLoader } from '../../components/JGLoader.vue'
export { default as ProfileActions } from '../../components/ProfileActions.vue'
export { default as TheAppBar } from '../../components/TheAppBar.vue'
export { default as TheForm } from '../../components/TheForm.vue'
export { default as TheMergeForm } from '../../components/TheMergeForm.vue'
export { default as TheMergeFormStudents } from '../../components/TheMergeFormStudents.vue'
export { default as TheMoveStudentsToNewSchoolClass } from '../../components/TheMoveStudentsToNewSchoolClass.vue'
export { default as TheProfessorCsvImport } from '../../components/TheProfessorCsvImport.vue'
export { default as TheStudentCsvImport } from '../../components/TheStudentCsvImport.vue'
export { default as TheStudentCsvImportExternalId } from '../../components/TheStudentCsvImportExternalId.vue'

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
