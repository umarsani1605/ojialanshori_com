<script setup>
import { ref, inject, onMounted } from 'vue';
import { useGradeStore } from '@/stores/gradeStore';

const dialogRef = inject('dialogRef');
const emit = defineEmits(['cancel', 'save']);
const gradeStore = useGradeStore();

const subject = dialogRef.value.data;
const formData = ref({
  ...subject,
  has_hafalan: Boolean(subject.has_hafalan),
  has_setoran: Boolean(subject.has_setoran),
});
const submitted = ref(false);
const categories = ref([]);

const fetchCategories = async () => {
  try {
    await gradeStore.fetchCategories();
    categories.value = gradeStore.getCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const onSave = () => {
  submitted.value = true;

  // Validasi semua field required
  if (!formData.value.name || !formData.value.id_category) {
    return;
  }
  emit('save', formData.value);
  dialogRef.value.close();
};

const onCancel = () => {
  emit('cancel');
  dialogRef.value.close();
};

onMounted(() => {
  fetchCategories();
  console.log('formData: ' + JSON.stringify(formData.value));
  console.log('has_hafalan: ' + formData.value.has_hafalan);
  console.log('has_setoran: ' + formData.value.has_setoran);
  console.log('has_hafalan: ' + Boolean(formData.value.has_hafalan));
  console.log('has_setoran: ' + Boolean(formData.value.has_setoran));
});
</script>

<template>
  <div class="p-fluid">
    <div class="field flex flex-col gap-2">
      <label for="name">Nama <span class="text-red-500">*</span></label>
      <InputText id="name" v-model="formData.name" required autofocus :class="{ 'p-invalid': submitted && !formData.name }" />
    </div>

    <div class="field flex flex-col gap-2">
      <label for="category">Kategori <span class="text-red-500">*</span></label>
      <Dropdown
        id="category"
        v-model="formData.id_category"
        :options="categories"
        optionLabel="name"
        optionValue="id"
        placeholder="Pilih Kategori"
        :class="{ 'p-invalid': submitted && !formData.id_category }"
      />
    </div>

    <div class="field flex items-center gap-2">
      <Checkbox id="has_hafalan" v-model="formData.has_hafalan" :binary="true" />
      <label for="has_hafalan">Hafalan</label>
    </div>

    <div class="field flex items-center gap-2">
      <Checkbox id="has_setoran" v-model="formData.has_setoran" :binary="true" />
      <label for="has_setoran">Setoran</label>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <Button label="Cancel" icon="pi pi-times" outlined @click="onCancel" />
      <Button label="Save" icon="pi pi-check" @click="onSave" />
    </div>
  </div>
</template>

<style scoped>
.field {
  margin-bottom: 1.5rem;
}
</style>
