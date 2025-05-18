<script setup>
import { ref, inject, onMounted, watch } from 'vue';
import SelectButton from 'primevue/selectbutton';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { useGradeStore } from '@/stores/gradeStore';
import { useSantriStore } from '@/stores/santriStore';
import { useRouter } from 'vue-router';

const router = useRouter();
const gradeStore = useGradeStore();
const dialogRef = inject('dialogRef');
const emit = defineEmits(['cancel', 'save']);
const santriStore = useSantriStore();

const statusOptions = [
  { label: 'Belum', value: 'belum' },
  { label: 'Proses', value: 'proses' },
  { label: 'Sudah', value: 'sudah' },
];

const grade = dialogRef.value.data;
const formData = ref({
  id_santri: grade.id_santri || '',
  id_pentashih: grade.id_pentashih || '',
  id_category: grade.id_category || '',
  id_subject: grade.id_subject || '',
  hafalan: grade.hafalan || 'belum',
  setoran: grade.setoran || 'belum',
});

const submitted = ref(false);
const pentashihList = ref([]);
const santriList = ref([]);
const categoryList = ref([]);
const subjectList = ref([]);
const isAdmin = ref(false);

const selectedPentashih = ref(null);
const selectedCategory = ref(null);
const selectedSubject = ref(null);

const fetchPentashihList = async () => {
  try {
    await gradeStore.fetchPentashih();
    pentashihList.value = gradeStore.getPentashihList;

    console.log('pentashih list', pentashihList.value);

    if (grade.id_pentashih) {
      selectedPentashih.value = pentashihList.value.find((p) => p.id === grade.id_pentashih);
    }
  } catch (error) {
    console.error('Error fetching pentashih list:', error);
  }
};

const fetchCategoryList = async () => {
  try {
    await gradeStore.fetchCategories();
    categoryList.value = gradeStore.getCategories;

    if (grade.id_category) {
      selectedCategory.value = categoryList.value.find((c) => c.id === grade.id_category);
    }
  } catch (error) {
    console.error('Error fetching category list:', error);
  }
};

const fetchSantriList = async () => {
  try {
    await santriStore.getAll();
  } catch (error) {
    console.error('Error fetching santri:', error);
  }
};

watch(selectedPentashih, async (newPentashih) => {
  try {
    if (isAdmin.value) {
      const response = await santriStore.getAll();
      santriList.value = response.data;
      console.log('santri list', santriList.value);
      formData.value.id_pentashih = '';
    } else {
      if (!newPentashih) {
        santriList.value = [];
        return;
      }
      const response = await gradeStore.getSantriByPentashihId(selectedPentashih.value.id);
      santriList.value = response.data;
      console.log('santri list', santriList.value);
      formData.value.id_pentashih = selectedPentashih.value.id;
    }
  } catch (error) {
    console.error('Error fetching santri list:', error);
  }
});

watch(selectedCategory, async (newCategory) => {
  try {
    if (newCategory) {
      const response = await gradeStore.fetchSubjectsByCategory(newCategory.id);
      subjectList.value = response.data;

      if (grade.id_subject) {
        const foundSubject = response.data.find((s) => s.id === grade.id_subject);
        selectedSubject.value = foundSubject || null;
      } else {
        selectedSubject.value = null;
      }
      formData.value.id_category = newCategory.id;
    } else {
      subjectList.value = [];
      selectedSubject.value = null;
      formData.value.id_subject = '';
    }
  } catch (error) {
    console.error('Error fetching subjects by category:', error);
  }
});

watch(selectedSubject, (newSubject) => {
  if (newSubject) {
    formData.value.id_subject = newSubject.id;
  } else {
    formData.value.id_subject = '';
    formData.value.hafalan = 'belum';
    formData.value.setoran = 'belum';
  }
});

watch(isAdmin, (newValue) => {
  if (newValue) {
    selectedPentashih.value = { id: 'admin', name: 'Admin' };
  } else {
    selectedPentashih.value = null;
  }
});

const onSave = () => {
  submitted.value = true;

  console.log('masuk 1: ', formData.value);

  if (!formData.value.id_santri || (!isAdmin.value && !selectedPentashih.value) || !formData.value.id_category || !formData.value.id_subject) {
    console.log('masuk 2');
    return;
  }

  const dataToSave = {
    ...formData.value,
    id_pentashih: isAdmin.value ? null : selectedPentashih.value.id,
    hafalan: selectedSubject.value?.has_hafalan ? formData.value.hafalan : null,
    setoran: selectedSubject.value?.has_setoran ? formData.value.setoran : null,
  };

  console.log('masuk 3: ', dataToSave);

  emit('save', dataToSave);
  dialogRef.value.close();
};

const goToSantriList = () => {
  router.push('/daftar-santri');
};

const onCancel = () => {
  emit('cancel');
  dialogRef.value.close();
};

onMounted(() => {
  fetchPentashihList();
  fetchCategoryList();
  fetchSantriList();
});
</script>

<template>
  <div class="p-fluid">
    <TabView>
      <TabPanel header="Pengisian Manual">
        <div class="field flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <label for="pentashih">Pentashih <span class="text-red-500">*</span></label>
            <div class="flex items-center gap-2">
              <Checkbox v-model="isAdmin" :binary="true" inputId="is-admin" />
              <label class="text-sm" for="is-admin">Sebagai Admin</label>
            </div>
          </div>
          <Dropdown
            id="pentashih"
            v-model="selectedPentashih"
            :options="pentashihList"
            optionLabel="name"
            :placeholder="isAdmin ? 'Admin' : 'Pilih Pentashih'"
            :class="{ 'p-invalid': submitted && !selectedPentashih && !isAdmin }"
            :disabled="isAdmin"
          />
        </div>

        <div class="field flex flex-col gap-2">
          <label for="santri">Santri <span class="text-red-500">*</span></label>
          <Dropdown
            id="santri"
            v-model="formData.id_santri"
            :options="santriList"
            optionLabel="name"
            optionValue="id"
            placeholder="Pilih Santri"
            :class="{ 'p-invalid': submitted && !formData.id_santri }"
            :disabled="!selectedPentashih"
          />
        </div>

        <div class="field flex flex-col gap-2">
          <label for="category">Kategori <span class="text-red-500">*</span></label>
          <Dropdown
            id="category"
            v-model="selectedCategory"
            :options="categoryList"
            optionLabel="name"
            placeholder="Pilih Kategori"
            :class="{ 'p-invalid': submitted && !selectedCategory }"
          />
        </div>

        <div class="field flex flex-col gap-2">
          <label for="subject">Mata Pelajaran <span class="text-red-500">*</span></label>
          <Dropdown
            id="subject"
            v-model="selectedSubject"
            :options="subjectList"
            optionLabel="name"
            placeholder="Pilih Mata Pelajaran"
            :class="{ 'p-invalid': submitted && !selectedSubject }"
            :disabled="!selectedCategory"
          />
        </div>

        <div class="flex flex-row gap-4">
          <div
            v-if="selectedSubject?.has_hafalan"
            class="field flex flex-col gap-2"
            :class="{ 'w-full': !selectedSubject?.has_setoran, 'w-1/2': selectedSubject?.has_setoran }"
          >
            <label for="hafalan">Status Hafalan</label>
            <SelectButton id="hafalan" v-model="formData.hafalan" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full">
              <template #option="{ option }">
                <span :class="option.class" class="rounded-md w-full text-center">{{ option.label }}</span>
              </template>
            </SelectButton>
          </div>

          <div
            v-if="selectedSubject?.has_setoran"
            class="field flex flex-col gap-2"
            :class="{ 'w-full': !selectedSubject?.has_hafalan, 'w-1/2': selectedSubject?.has_hafalan }"
          >
            <label for="setoran">Status Setoran</label>
            <SelectButton id="setoran" v-model="formData.setoran" :options="statusOptions" optionLabel="label" optionValue="value" class="w-full">
              <template #option="{ option }">
                <span :class="option.class" class="rounded-md w-full text-center">{{ option.label }}</span>
              </template>
            </SelectButton>
          </div>
        </div>
      </TabPanel>

      <TabPanel header="Upload Gambar">
        <div class="flex flex-col gap-4">
          <div class="field">
            <FileUpload
              mode="advanced"
              :multiple="false"
              accept="image/*"
              :maxFileSize="1000000"
              class="custom-upload"
              :showUploadButton="false"
              :showCancelButton="false"
              invalidFileSizeMessage="Ukuran file terlalu besar (maksimal 1MB)"
              invalidFileTypeMessage="Format file tidak didukung"
              chooseLabel="Pilih Gambar"
            >
              <template #empty>
                <div class="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <i class="pi pi-image text-4xl text-gray-400 mb-4"></i>
                  <span class="text-gray-600">Drag and drop file di sini atau</span>
                  <span class="text-blue-500 font-semibold cursor-pointer mt-2">pilih file</span>
                </div>
              </template>
            </FileUpload>
          </div>
          <div class="text-sm text-gray-500">
            <p>Catatan:</p>
            <ul class="list-disc list-inside">
              <li>Format gambar yang didukung: JPG, PNG</li>
              <li>Ukuran maksimal file: 1MB</li>
              <li>Pastikan gambar jelas dan tidak blur</li>
            </ul>
          </div>
        </div>
      </TabPanel>
    </TabView>

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

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(1)) {
  @apply text-red-700;
}

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(2)) {
  @apply text-yellow-700;
}

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(3)) {
  @apply text-green-700;
}

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(1):before) {
  @apply bg-red-100;
}

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(2):before) {
  @apply bg-yellow-100;
}

:deep(.p-togglebutton.p-togglebutton-checked:nth-child(3):before) {
  @apply bg-green-100;
}

:deep(.custom-upload .p-fileupload-content) {
  @apply border-none;
}

:deep(.custom-upload .p-fileupload-buttonbar) {
  @apply hidden;
}

:deep(.custom-upload .p-fileupload-drag-hover) {
  @apply border-blue-500;
}
</style>
